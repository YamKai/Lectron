const express = require('express');
const router = express.Router();

const {DockerRun, LANGUAGE_CONFIGS} = require('../utils/docker');
const {writeTempFile, deleteTempFile} = require('../utils/fileManager');

const supported = Object.keys(LANGUAGE_CONFIGS);
const maxCodeLength = 10_000;

router.post('/', async (req, res, next) => {
  const language = req.body.language;
  const code = req.body.code;

  if (!language || !supported.includes(language))
    return res.status(400).json({error: `Unsupported language. supported: ${supported.join(', ')}`});
  if (!code || typeof code !== 'string')
    return res.status(400).json({error: 'Missing code'});
  if (code.length > maxCodeLength)
    return res.status(400).json({error: `Code is too long, exceeded by ${code.length - maxCodeLength} chars`});

  let tempFilePath = null;
  try {
    tempFilePath = await writeTempFile(code, language);
    const result = await DockerRun(tempFilePath, language);
    return res.json(result);
  } catch (err) {
    next(err);
  } finally {
    if (tempFilePath) await deleteTempFile(tempFilePath);
  }

});

router.get('/', (_req, res) => {
  res.json({
    endpoint: 'POST /api/execute',
    supported: supported,
    limits: {
      memory: process.env.DOCKER_MEMORY_LIMIT || '128m',
      cpus: process.env.DOCKER_CPU_LIMIT || '0.5',
      timeoutMs: parseInt(process.env.DOCKER_TIMEOUT_MS || '10000', 10),
      maxCodeLength: maxCodeLength,
    },
  });
});

module.exports = router;