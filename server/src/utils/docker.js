const {spawn} = require('child_process');

const LANGUAGE_CONFIGS = {
  python: {
    image: process.env.DOCKER_PYTHON_IMAGE || 'backend-python',
    mountPath: '/safeuser/solution.py',
    extension: '.py',
  }

  /*
  javascript: {
    image: process.env.DOCKER_JS_IMAGE || 'backend-js',
    mountPath: '/safeuser/solution.js',
    extension: '.js',
  },
  */
 
  // other languages tba here

};

function getConfig(language) {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) throw new Error(`Unsupported language: "${language}"`);
  return config;
}

async function DockerRun(hostFilePath, language) {
  const config = getConfig(language);
  const timeoutMs = parseInt(process.env.DOCKER_TIMEOUT_MS || '10000', 10);
  const memory = process.env.DOCKER_MEMORY_LIMIT || '128m';
  const cpus = process.env.DOCKER_CPU_LIMIT || '0.5';

  // we use this for timing out
  const tcont = new AbortController();
  const timer = setTimeout(() => tcont.abort(), timeoutMs);

  // these are the args & they include the limits imposed on the container
  const args = [
    'run', '--rm', '--network', 'none', 
    '--memory', memory,
    '--cpus', cpus,
    '--read-only', '--user', '1001:1001',
    '-v', `${hostFilePath.replace(/\\/g, '/')}:${config.mountPath}:ro`,
    config.image,
  ];

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const proc = spawn('docker', args, {signal: tcont.signal});

    proc.stdout.on('data', (d) => {stdout += d.toString();});
    proc.stderr.on('data', (d) => {stderr += d.toString();});

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.slice(0, 50_000), // control output amount by slicing it
        stderr: stderr.slice(0, 10_000),
        exitCode: code ?? -1,
        timedOut,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (tcont.signal.aborted) {
        timedOut = true;
        resolve({ stdout: stdout.slice(0, 50_000), stderr: 'Execution timed out', exitCode: -1, timedOut: true });
      } else {
        resolve({ stdout: '', stderr: `Docker error: ${err.message}`, exitCode: -1, timedOut: false });
      }
    });
  });
}

module.exports = {DockerRun, LANGUAGE_CONFIGS, getConfig};