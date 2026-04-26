const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'usuarios.json');
const NETWORKS_FILE = path.join(DATA_DIR, 'redes.json');
const HISTORY_FILE = path.join(DATA_DIR, 'historial.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function ensureFile(filePath, defaultContent) {
  ensureDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
  }
}

function initializeStorage() {
  ensureFile(USERS_FILE, { users: [] });
  ensureFile(NETWORKS_FILE, { networks: [] });
  ensureFile(HISTORY_FILE, { history: [] });
}

function readJson(filePath, defaultContent) {
  ensureFile(filePath, defaultContent);
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) {
    return defaultContent;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return defaultContent;
  }
}

function writeJson(filePath, payload) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function nextId(items) {
  if (!items.length) {
    return 1;
  }
  return Math.max(...items.map((item) => Number(item.id || 0))) + 1;
}

module.exports = {
  USERS_FILE,
  NETWORKS_FILE,
  HISTORY_FILE,
  initializeStorage,
  readJson,
  writeJson,
  nextId,
};
