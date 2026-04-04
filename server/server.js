require('dotenv').config();
const http = require('http');
const { WebSocketServer } = require('ws');
const app = require('./src/app');
const { checkTempDir } = require('./src/utils/fileManager');
const { handleWsExecute } = require('./src/routes/wsExecute');

const PORT = process.env.PORT || 3001;
const MAX_CONCURRENT_WS = parseInt(process.env.MAX_CONCURRENT_WS || '100', 10);

async function main() {
  await checkTempDir();

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws/execute' });

  wss.on('connection', (ws) => {
    // First message must be the 'start' payload
    if (wss.clients.size > MAX_CONCURRENT_WS) {
      ws.close(1013, 'Server at capacity, try again shortly');
      return;
    }

    ws.once('message', (msg) => handleWsExecute(ws, msg.toString()));
  });

  server.listen(PORT, () => {});

  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}

main().catch(err => { console.error(err); process.exit(1); });