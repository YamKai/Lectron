const fs = require('fs').promises;
const path = require('path');
const {v4: uuidv4} = require('uuid');
const {getConfig} = require('./docker');

const TEMP_DIR = path.resolve(process.cwd(), process.env.TEMP_DIR || './temp');

// Files older than this (in ms) are considered orphaned and swept on startup.
// Default: 1 hour. Override with TEMP_FILE_MAX_AGE_MS in .env.
const ORPHAN_MAX_AGE_MS = parseInt(process.env.TEMP_FILE_MAX_AGE_MS || String(60 * 60 * 1000), 10);

/**
 * Ensures the temp directory exists and sweeps any files left behind by a
 * previous crash. Only files older than ORPHAN_MAX_AGE_MS are removed so that
 * files belonging to executions that started just before a restart are left
 * alone.
 */
async function checkTempDir() {
  await fs.mkdir(TEMP_DIR, {recursive: true});
  await sweepOrphanedTempFiles();
}

async function sweepOrphanedTempFiles() {
  let entries;
  try {
    entries = await fs.readdir(TEMP_DIR);
  } catch {
    return; // dir doesn't exist yet — first run before mkdir, shouldn't happen
  }

  const now = Date.now();
  let swept = 0;

  await Promise.all(entries.map(async (name) => {
    const filePath = path.join(TEMP_DIR, name);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile() && (now - stat.mtimeMs) > ORPHAN_MAX_AGE_MS) {
        await fs.unlink(filePath);
        swept++;
      }
    } catch {
      // file may have already been removed concurrently — ignore
    }
  }));

  if (swept > 0) {
    console.log(`[fileManager] swept ${swept} orphaned temp file(s) on startup`);
  }
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