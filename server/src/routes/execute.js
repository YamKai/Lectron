const express  = require('express');
const router   = express.Router();
const { runInDocker, LANGUAGE_CONFIGS } = require('../utils/docker');
const { writeTempFile, deleteTempFile } = require('../utils/fileManager');

const SUPPORTED = Object.keys(LANGUAGE_CONFIGS);
const MAX_LEN   = 10_000;

router.post('/', async (req, res, next) => {
  const language = req.body.language;
  const code = req.body.code;

  if (!language || !SUPPORTED.includes(language))
    return res.status(400).json({ error: `Unsupported language. Supported: ${SUPPORTED.join(', ')}` });
  if (!code || typeof code !== 'string')
    return res.status(400).json({ error: 'Missing "code" field.' });
  if (code.length > MAX_LEN)
    return res.status(400).json({ error: `Code exceeds ${MAX_LEN} character limit.` });

  let tempFilePath = null;
  try {
    tempFilePath = await writeTempFile(code, language);
    const result = await runInDocker(tempFilePath, language);
    return res.json(result);
  } catch (err) {
    next(err);
  } finally {
    if (tempFilePath) await deleteTempFile(tempFilePath);
  }
});

router.get('/', (_req, res) => {
  res.json({
    endpoint  : 'POST /api/execute',
    supported : SUPPORTED,
    limits: {
      memory     : process.env.DOCKER_MEMORY_LIMIT || '128m',
      cpus       : process.env.DOCKER_CPU_LIMIT    || '0.5',
      timeoutMs  : parseInt(process.env.DOCKER_TIMEOUT_MS || '10000', 10),
      maxCodeLength: MAX_LEN,
    },
  });
});

module.exports = router;