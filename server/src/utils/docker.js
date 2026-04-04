const {spawn} = require('child_process');
const {v4: uuidv4} = require('uuid');

const LANGUAGE_CONFIGS = {
  python: {
    image: process.env.DOCKER_PYTHON_IMAGE || 'backend-python',
    mountPath: '/safeuser/solution.py',
    extension: '.py',
  }
  // other languages tba here
};

function getConfig(language) {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) throw new Error(`Unsupported language: "${language}"`);
  return config;
}

// Shared resource limits applied to every container — both interactive and batch.
function resourceArgs() {
  const memory = process.env.DOCKER_MEMORY_LIMIT || '128m';
  const cpus   = process.env.DOCKER_CPU_LIMIT    || '0.5';
  const pids   = process.env.DOCKER_PIDS_LIMIT   || '64';
  return [
    '--memory',      memory,
    '--memory-swap', memory,   // FIX: disables swap entirely (swap == memory == no extra)
    '--cpus',        cpus,
    '--pids-limit',  pids,     // FIX: prevents fork-bomb from escaping the memory cap
    '--stop-timeout','2',      // FIX: 2s grace period instead of Docker's default 10s
  ];
}

// stdinLines: optional array of strings to pipe as stdin (each gets \n appended)
async function DockerRun(hostFilePath, language, stdinLines = []) {
  const config = getConfig(language);
  const timeoutMs = parseInt(process.env.DOCKER_TIMEOUT_MS || '10000', 10);

  // FIX: cap stdout during collection, not only at resolve-time.
  // Without this, a program printing flat-out for 10s can fill gigabytes of
  // Node.js heap before proc.on('close') fires and the old slice ran.
  const MAX_COLLECT_BYTES = parseInt(process.env.MAX_OUTPUT_BYTES || '51200', 10);

  const tcont = new AbortController();
  const timer = setTimeout(() => tcont.abort(), timeoutMs);

  const args = [
    'run', '--rm', '-i', '--network', 'none',
    ...resourceArgs(),
    '--read-only', '--user', '1001:1001',
    '-v', `${hostFilePath.replace(/\\/g, '/')}:${config.mountPath}:ro`,
    config.image,
  ];

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let capHit = false;

    const proc = spawn('docker', args, { signal: tcont.signal });

    proc.stdout.on('data', (d) => {
      if (capHit) return;                          // FIX: discard after cap
      const chunk = d.toString();
      if (stdout.length + chunk.length > MAX_COLLECT_BYTES) {
        stdout += chunk.slice(0, MAX_COLLECT_BYTES - stdout.length);
        capHit = true;
      } else {
        stdout += chunk;
      }
    });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    if (stdinLines.length > 0) {
      proc.stdin.write(stdinLines.join('\n') + '\n');
    }
    proc.stdin.end();

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.slice(0, MAX_COLLECT_BYTES),
        stderr: stderr.slice(0, 10_000),
        exitCode: code ?? -1,
        timedOut,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (tcont.signal.aborted) {
        timedOut = true;
        resolve({ stdout: stdout.slice(0, MAX_COLLECT_BYTES), stderr: 'Execution timed out', exitCode: -1, timedOut: true });
      } else {
        resolve({ stdout: '', stderr: `Docker error: ${err.message}`, exitCode: -1, timedOut: false });
      }
    });
  });
}

// FIX: containers are now named so wsExecute can call `docker kill <name>`
// directly (SIGKILL, no grace period) rather than relying on killing the
// `docker run` CLI process and hoping Docker propagates it in time.
function DockerRunInteractive(hostFilePath, language) {
  const config = getConfig(language);
  const containerName = `lectron-${uuidv4()}`;

  const args = [
    'run', '--rm', '-i', '--network', 'none',
    '--name', containerName,   // FIX: named for reliable explicit kill
    ...resourceArgs(),
    '--read-only', '--user', '1001:1001',
    '-v', `${hostFilePath.replace(/\\/g, '/')}:${config.mountPath}:ro`,
    config.image,
  ];

  const proc = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
  return { proc, containerName };
}

// Force-kills a container by name using SIGKILL — bypasses the stop-timeout
// grace period entirely. Safe to call even if the container has already exited.
function killContainer(containerName) {
  return new Promise((resolve) => {
    const killer = spawn('docker', ['kill', containerName]);
    killer.on('close', resolve);
    killer.on('error', resolve); // ignore — container may already be gone
  });
}

module.exports = {DockerRun, DockerRunInteractive, killContainer, LANGUAGE_CONFIGS, getConfig};
