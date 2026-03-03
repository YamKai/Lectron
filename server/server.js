require('dotenv').config();
const app = require('./src/app');
const {checkTempDir} = require('./src/utils/fileManager');

const PORT = process.env.PORT || 3001;

async function main() {
  await checkTempDir();
  const server = app.listen(PORT, () => {
    // testing
    // console.log(`http://localhost:${PORT}`);
    // console.log(`image: ${process.env.DOCKER_PYTHON_IMAGE || 'backend-python'} | memory: ${process.env.DOCKER_MEMORY_LIMIT || '128m'} | cpu: ${process.env.DOCKER_CPU_LIMIT || '0.5'} | timeout duration: ${process.env.DOCKER_TIMEOUT_MS || 10000}ms`);
  });
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}
main().catch(err => { console.error(err); process.exit(1); });