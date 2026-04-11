const { DockerRun, DockerRunInteractive, killContainer, LANGUAGE_CONFIGS } = require('../utils/docker');
const { writeTempFile, deleteTempFile } = require('../utils/fileManager');
const supabase = require('../supabaseClient');

const supported = Object.keys(LANGUAGE_CONFIGS);
const maxCodeLength = parseInt(process.env.MAX_CODE_LENGTH || '10000', 10);

/* -- MAIN CHANGES FOR THIS COMMIT ------------------------------------------
  added 'taskIndex' to be able to specify the eval of which task
  added better cleanup, got rid of vulnerability, fixed timeout issue, process killing

*/

/* evaluation format:
    eval: { "inputs": ["Alice", "30"], "expected": "Hello Alice, you are 30!", "output_only": true, taskIndex: 0 }

  No input:
    eval: { "inputs": [], "expected": "Hello, world!" }

  plain string also works (won't account for user inputs)
    eval: "Hello, world!"
*/

function parseEvaluation(raw) {
  try {
    const obj = JSON.parse(raw);
    const inputs = Array.isArray(obj.inputs) ? obj.inputs.map(String) : [];
    const expected = typeof obj.expected === 'string' ? obj.expected : null;
    const outputOnly = obj.output_only === true;
    return { inputs, expected, outputOnly, inputCount: inputs.length };
  } catch {
    return {
      inputs: [],
      expected: typeof raw === 'string' ? raw : null,
      outputOnly: false,
      inputCount: 0,
    };
  }
}

async function current_eval(sessionId, lectureId, taskIndex) {
  const { data: tasks, error: tErr } = await supabase
    .from('task')
    .select('evaluation')
    .eq('lecture_id', lectureId)
    .order('index', { ascending: true });

  if (tErr || !tasks || tasks.length === 0) return null;

  let effectiveIndex;

  if (taskIndex !== undefined && taskIndex !== null) {
    effectiveIndex = taskIndex;
  } else {
    const { data: session, error: sErr } = await supabase
      .from('lecture_session')
      .select('session_progress')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (sErr || !session) return null;
    effectiveIndex = session.session_progress;
  }

  if (effectiveIndex < 0 || effectiveIndex >= tasks.length) return null;

  const evalData = parseEvaluation(tasks[effectiveIndex].evaluation);
  if (!evalData) return null;

  return { ...evalData, currentIndex: effectiveIndex };
}

// normalize and compare
function normalize(s) {
  return s.trim().replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '');
}

function compareOutput(actual, evalData) {
  return normalize(actual) === normalize(evalData.expected);
}

// Websocket handler
async function handleWsExecute(ws, rawMessage) {
  let parsed;
  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    ws.close(1008, 'Invalid JSON');
    return;
  }

  // session needs to start with 'type': 'start'
  if (parsed.type !== 'start') {
    ws.close(1008, 'Expected start message');
    return;
  }

  const { code, language, sessionId, lectureId, directEvaluation } = parsed;

  let taskIndex = parsed.taskIndex;
  if (taskIndex !== undefined && taskIndex !== null) {
    taskIndex = parseInt(taskIndex, 10);
    if (!Number.isInteger(taskIndex) || taskIndex < 0) {
      ws.send(JSON.stringify({ type: 'error', message: 'taskIndex must be a non-negative integer' }));
      ws.close();
      return;
    }
  }

  if (!language || !supported.includes(language)) {
    ws.send(JSON.stringify({ type: 'error', message: `Unsupported language. Supported: ${supported.join(', ')}` }));
    ws.close();
    return;
  }
  if (!code || typeof code !== 'string') {
    ws.send(JSON.stringify({ type: 'error', message: 'Missing code' }));
    ws.close();
    return;
  }
  if (code.length > maxCodeLength) {
    ws.send(JSON.stringify({ type: 'error', message: `Code too long by ${code.length - maxCodeLength} amount` }));
    ws.close();
    return;
  }

  const timeoutMs = parseInt(process.env.DOCKER_TIMEOUT_MS || '30000', 10);
  let tempFilePath    = null;
  let evalTempFilePath = null;
  let cleanedUp       = false;

  async function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;
    if (tempFilePath) { await deleteTempFile(tempFilePath); tempFilePath = null; }
    if (evalTempFilePath) { await deleteTempFile(evalTempFilePath); evalTempFilePath = null; }
  }

  function sendJson(obj) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  }

  try {
    tempFilePath = await writeTempFile(code, language);
  } catch (err) {
    sendJson({ type: 'error', message: `Failed to write temp file: ${err.message}` });
    ws.close();
    return;
  }

  const MAX_OUTPUT_BYTES = parseInt(process.env.MAX_OUTPUT_BYTES || '51200', 10); // 50 KB

  let timedOut = false;
  let outputBytes = 0;
  let outputCapped = false;

  const { proc, containerName } = DockerRunInteractive(tempFilePath, language);

  const timer = setTimeout(() => {
    timedOut = true;
    killContainer(containerName);
    if (!proc.killed) proc.kill('SIGKILL');
  }, timeoutMs);

  proc.stdout.on('data', (d) => {
    if (outputCapped) return;

    const chunk = d.toString();
    outputBytes += Buffer.byteLength(chunk, 'utf8');

    if (outputBytes > MAX_OUTPUT_BYTES) {
      outputCapped = true;
      sendJson({ type: 'stdout', data: chunk.slice(0, 200) });
      sendJson({ type: 'stderr', data: '\n[Output limit reached — process killed]\n' });
      clearTimeout(timer);
      killContainer(containerName);
      if (!proc.killed) proc.kill('SIGKILL');
      return;
    }

    sendJson({ type: 'stdout', data: chunk });
  });

  proc.stderr.on('data', (d) => {
    if (outputCapped) return;
    sendJson({ type: 'stderr', data: d.toString() });
  });

  ws.on('message', (msg) => {
    try {
      const m = JSON.parse(msg.toString());
      if (m.type === 'input' && !proc.killed && proc.stdin.writable) {
        proc.stdin.write(m.data);
      }
    } catch {}
  });

  ws.on('close', async () => {
    clearTimeout(timer);
    killContainer(containerName);
    if (!proc.killed) proc.kill('SIGKILL');
    await cleanup();
  });

  proc.on('error', async (err) => {
    clearTimeout(timer);
    sendJson({ type: 'error', message: `Docker error: ${err.message}` });
    await killContainer(containerName);
    await cleanup();
    ws.close();
  });

  proc.on('close', async (exitCode) => {
    clearTimeout(timer);

    if (ws.readyState !== ws.OPEN) {
      await cleanup();
      return;
    }

    sendJson({ type: 'exit', exitCode: exitCode ?? -1, timedOut });

    if (timedOut) {
      sendJson({ type: 'eval_result', passed: false, message: 'Execution timed out - task not evaluated' });
      await cleanup();
      ws.close();
      return;
    }

    // Support directEvaluation for exam task questions (no lectureId needed)
    const useDirectEval = directEvaluation !== undefined && directEvaluation !== null;

    if (!useDirectEval && (!sessionId || !lectureId)) {
      sendJson({ type: 'eval_result', passed: false, message: 'No session context - task not evaluated' });
      await cleanup();
      ws.close();
      return;
    }

    //
    // EVALUATION PART
    //

    try {
      const evalData = useDirectEval
        ? parseEvaluation(typeof directEvaluation === 'string' ? directEvaluation : JSON.stringify(directEvaluation))
        : await current_eval(sessionId, lectureId, taskIndex);

      if (!evalData || evalData.expected === null) {
        sendJson({ type: 'eval_result', passed: false, message: 'No evaluation found for current task' });
        await cleanup();
        ws.close();
        return;
      }

      const codeInputCallCount = (code.match(/\binput\s*\(/g) || []).length;
      if (codeInputCallCount !== evalData.inputCount) {
        sendJson({
          type: 'eval_result',
          passed: false,
          message: `Input count mismatch: your code has ${codeInputCallCount} input() call(s) but the task evaluation provides ${evalData.inputCount}.`,
        });
        await cleanup();
        ws.close();
        return;
      }

      // we inject a patch at the start to make docker not print the input prompt string, to make
      // evaluating possible
      let fileToRun = tempFilePath;
      if (evalData.outputOnly && language === 'python') {
        const promptSuppressorPatch = `import sys, builtins\nbuiltins.input = lambda prompt='': sys.stdin.readline().rstrip('\\n')\n`;
        evalTempFilePath = await writeTempFile(promptSuppressorPatch + code, language);
        fileToRun = evalTempFilePath;
      }
      // tba js condition here

      // re-run with the predefined inputs piped to stdin
      const result = await DockerRun(fileToRun, language, evalData.inputs);
      await cleanup();

      if (result.timedOut) {
        sendJson({ type: 'eval_result', passed: false, message: 'Evaluation run timed out' });
        ws.close();
        return;
      }

      const passed = compareOutput(result.stdout, evalData);

      if (passed) {
        // Only update lecture_session progress for lecture tasks, not exam tasks
        if (!useDirectEval && sessionId) {
          const { data: freshSession } = await supabase
            .from('lecture_session')
            .select('session_progress')
            .eq('session_id', sessionId)
            .maybeSingle();

          if (freshSession) {
            const effectiveIndex = (taskIndex !== undefined && taskIndex !== null)
              ? taskIndex
              : freshSession.session_progress;

            if (effectiveIndex === freshSession.session_progress) {
              await supabase
                .from('lecture_session')
                .update({ session_progress: freshSession.session_progress + 1 })
                .eq('session_id', sessionId);
            }
          }
        }

        sendJson({ type: 'eval_result', passed: true });
      } else {
        sendJson({ type: 'eval_result', passed: false });
      }
    } catch (err) {
      await cleanup();
      sendJson({ type: 'eval_result', passed: false, message: 'Evaluation error' });
    }

    ws.close();
  });
}

module.exports = { handleWsExecute };