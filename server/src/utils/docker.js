const { spawn } = require('child_process');

const LANGUAGE_CONFIGS = {
  python: {
    image    : process.env.DOCKER_PYTHON_IMAGE || 'backend-python',
    mountPath: '/safeuser/solution.py',
    extension: '.py',
  },
  // other languages here
};

function getConfig(language) {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) throw new Error(`Unsupported language: "${language}"`);
  return config;
}

async function runInDocker(hostFilePath, language) {
  const config    = getConfig(language);
  const timeoutMs = parseInt(process.env.DOCKER_TIMEOUT_MS || '10000', 10);
  const memory    = process.env.DOCKER_MEMORY_LIMIT || '128m';
  const cpus      = process.env.DOCKER_CPU_LIMIT    || '0.5';

  // time out after specified duration
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // these are the limits imposed on the container
  const args = [
    'run', '--rm',
    '--network', 'none',
    '--memory',  memory,
    '--cpus',    cpus,
    '--read-only',
    '--user', '1001:1001',
    '-v', `${hostFilePath.replace(/\\/g, '/')}:${config.mountPath}:ro`,
    config.image,
  ];

  return new Promise((resolve) => {
    let stdout = '', stderr = '', timedOut = false;

    const proc = spawn('docker', args, { signal: controller.signal });

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout  : stdout.slice(0, 50_000),
        stderr  : stderr.slice(0, 10_000),
        exitCode: code ?? -1,
        timedOut,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (controller.signal.aborted) {
        timedOut = true;
        resolve({ stdout: stdout.slice(0, 50_000), stderr: 'Execution timed out.', exitCode: -1, timedOut: true });
      } else {
        resolve({ stdout: '', stderr: `Docker error: ${err.message}`, exitCode: -1, timedOut: false });
      }
    });
  });
}

module.exports = { runInDocker, LANGUAGE_CONFIGS, getConfig };