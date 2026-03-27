const { DockerRun, DockerRunInteractive, LANGUAGE_CONFIGS } = require('../utils/docker');
const { writeTempFile, deleteTempFile } = require('../utils/fileManager');
const supabase = require('../supabaseClient');

const supported = Object.keys(LANGUAGE_CONFIGS);
const maxCodeLength = parseInt(process.env.MAX_CODE_LENGTH || '100000', 10);

/* evaluation format:
    eval: { "inputs": ["Alice", "30"], "expected": "Hello Alice, you are 30!", "output_only": true }

  No input:
    eval: { "inputs": [], "expected": "Hello, world!" }

  plain string also works (won't account for user inputs of course)
    eval: "Hello, world!"
*/


// turning the eval into a structured object
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

// fetches the current eval for the current task based on session progress
async function current_eval(sessionId, lectureId) {
  const { data: session, error: sErr } = await supabase
    .from('lecture_session')
    .select('session_progress')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (sErr || !session) return null;

  const { data: tasks, error: tErr } = await supabase
    .from('task')
    .select('evaluation')
    .eq('lecture_id', lectureId)
    .order('index', { ascending: true });

  if (tErr || !tasks || tasks.length === 0) return null;

  const progress = session.session_progress;
  if (progress >= tasks.length) return null;

  const evalData = parseEvaluation(tasks[progress].evaluation);
  if (!evalData) return null;

  return { ...evalData, currentProgress: progress };
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

  const { code, language, sessionId, lectureId } = parsed;

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

  const timeoutMs = parseInt(process.env.DOCKER_TIMEOUT_MS || '100000000', 10);
  let tempFilePath = null;
  let evalTempFilePath = null;
  let cleanedUp = false;
  

  // cleanup function used in several exit paths
  async function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;
    if (tempFilePath) {
      await deleteTempFile(tempFilePath);
      tempFilePath = null;
    }
    if (evalTempFilePath) {
      await deleteTempFile(evalTempFilePath);
      evalTempFilePath = null;
    }
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

  let timedOut = false;
  const proc = DockerRunInteractive(tempFilePath, language);

  const timer = setTimeout(() => {
    timedOut = true;
    if (!proc.killed) proc.kill('SIGKILL');
  }, timeoutMs);

  proc.stdout.on('data', (d) => sendJson({ type: 'stdout', data: d.toString() }));
  proc.stderr.on('data', (d) => sendJson({ type: 'stderr', data: d.toString() }));

  // forward user input to docker stdin
  ws.on('message', (msg) => {
    try {
      const m = JSON.parse(msg.toString());
      if (m.type === 'input' && proc.stdin.writable) {
        proc.stdin.write(m.data);
      }
    } catch {}
  });

  ws.on('close', async () => {
    clearTimeout(timer);
    if (!proc.killed) proc.kill('SIGKILL');
    await cleanup();
  });

  proc.on('error', async (err) => {
    clearTimeout(timer);
    sendJson({ type: 'error', message: `Docker error: ${err.message}` });
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

    if (!sessionId || !lectureId) {
      await cleanup();
      ws.close();
      return;
    }

    //
    // EVALUATION PART
    //

    try {
      const evalData = await current_eval(sessionId, lectureId);

      if (!evalData || evalData.expected === null) {
        sendJson({ type: 'eval_result', passed: false, message: 'No evaluation found for current task' });
        await cleanup();
        ws.close();
        return;
      }

      // making sure the number of input()s matches the eval
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
        const { data: freshSession } = await supabase
          .from('lecture_session')
          .select('session_progress')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (freshSession) {
          await supabase
            .from('lecture_session')
            .update({ session_progress: freshSession.session_progress + 1 })
            .eq('session_id', sessionId);
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