const fs = require('fs').promises;
const path = require('path');
const {v4: uuidv4} = require('uuid');
const {getConfig} = require('./docker');

const TEMP_DIR = path.resolve(process.cwd(), process.env.TEMP_DIR || './temp');

async function checkTempDir() {
  await fs.mkdir(TEMP_DIR, {recursive: true});
  // console.log('Temp directory ready:', TEMP_DIR);
}

async function writeTempFile(code, language) {
  const {extension} = getConfig(language);
  const filePath = path.join(TEMP_DIR, `${uuidv4()}${extension}`);
  await fs.writeFile(filePath, code, 'utf8');
  return filePath;
}

async function deleteTempFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn('could not delete temp file:', filePath);
  }
}

module.exports = {checkTempDir, writeTempFile, deleteTempFile};