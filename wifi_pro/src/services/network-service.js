const { NETWORKS_FILE, HISTORY_FILE, readJson, writeJson, nextId } = require('../lib/storage');
const { analyzeNetwork } = require('../lib/risk-engine');

function nowIsoSeconds() {
  return new Date().toISOString().slice(0, 19);
}

function loadNetworks() {
  return readJson(NETWORKS_FILE, { networks: [] });
}

function saveNetworks(payload) {
  writeJson(NETWORKS_FILE, payload);
}

function loadHistory() {
  return readJson(HISTORY_FILE, { history: [] });
}

function saveHistory(payload) {
  writeJson(HISTORY_FILE, payload);
}

function listByUser(userId) {
  const data = loadNetworks();
  return data.networks
    .filter((n) => Number(n.user_id) === Number(userId))
    .sort((a, b) => Number(a.id) - Number(b.id));
}

function get(networkId, userId) {
  return listByUser(userId).find((n) => Number(n.id) === Number(networkId)) || null;
}

function create(userId, name, networkType, encryption, password) {
  const data = loadNetworks();
  const now = nowIsoSeconds();
  const record = {
    id: nextId(data.networks),
    user_id: Number(userId),
    name: String(name).trim(),
    network_type: networkType,
    encryption,
    password: String(password || ''),
    last_score: 0,
    last_level: 'SEGURO',
    last_indicator: '🟢',
    created_at: now,
    updated_at: now,
  };

  data.networks.push(record);
  saveNetworks(data);
  return record;
}

function update(networkId, userId, name, networkType, encryption, password) {
  const data = loadNetworks();
  const target = data.networks.find(
    (n) => Number(n.id) === Number(networkId) && Number(n.user_id) === Number(userId)
  );

  if (!target) {
    return null;
  }

  target.name = String(name).trim();
  target.network_type = networkType;
  target.encryption = encryption;
  target.password = String(password || '');
  target.updated_at = nowIsoSeconds();
  saveNetworks(data);
  return target;
}

function saveAnalysis(networkId, userId, score, level, indicator) {
  const data = loadNetworks();
  const target = data.networks.find(
    (n) => Number(n.id) === Number(networkId) && Number(n.user_id) === Number(userId)
  );

  if (!target) {
    return;
  }

  target.last_score = Number(score);
  target.last_level = level;
  target.last_indicator = indicator;
  target.updated_at = nowIsoSeconds();
  saveNetworks(data);
}

function addHistory(networkId, userId, score, level, indicator) {
  const payload = loadHistory();
  payload.history.push({
    id: nextId(payload.history),
    network_id: Number(networkId),
    user_id: Number(userId),
    score: Number(score),
    level,
    indicator,
    created_at: nowIsoSeconds(),
  });
  saveHistory(payload);
}

function listHistory(networkId, userId, limit = 10) {
  const payload = loadHistory();
  return payload.history
    .filter((h) => Number(h.network_id) === Number(networkId) && Number(h.user_id) === Number(userId))
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, limit);
}

function deleteHistoryForNetwork(networkId, userId) {
  const payload = loadHistory();
  payload.history = payload.history.filter(
    (h) => !(Number(h.network_id) === Number(networkId) && Number(h.user_id) === Number(userId))
  );
  saveHistory(payload);
}

function remove(networkId, userId) {
  const data = loadNetworks();
  const initial = data.networks.length;
  data.networks = data.networks.filter(
    (n) => !(Number(n.id) === Number(networkId) && Number(n.user_id) === Number(userId))
  );

  if (data.networks.length === initial) {
    return false;
  }

  saveNetworks(data);
  deleteHistoryForNetwork(networkId, userId);
  return true;
}

function analyzeOne(networkId, userId) {
  const network = get(networkId, userId);
  if (!network) {
    return { ok: false, message: 'Selecciona una red válida para analizar.', result: null };
  }

  const result = analyzeNetwork(network.network_type, network.encryption, network.password || '');
  saveAnalysis(networkId, userId, result.score, result.level, result.indicator);
  addHistory(networkId, userId, result.score, result.level, result.indicator);

  return {
    ok: true,
    message: 'Análisis completado correctamente.',
    result: {
      network_id: Number(networkId),
      name: network.name,
      score: result.score,
      level: result.level,
      color: result.color,
      indicator: result.indicator,
    },
  };
}

function analyzeAll(userId) {
  const networks = listByUser(userId);
  if (!networks.length) {
    return { ok: false, message: 'No hay redes para analizar.', results: [] };
  }

  const results = networks.map((network) => {
    const result = analyzeNetwork(network.network_type, network.encryption, network.password || '');
    saveAnalysis(network.id, userId, result.score, result.level, result.indicator);
    addHistory(network.id, userId, result.score, result.level, result.indicator);

    return {
      network_id: network.id,
      name: network.name,
      score: result.score,
      level: result.level,
      color: result.color,
      indicator: result.indicator,
    };
  });

  return { ok: true, message: 'Análisis general completado.', results };
}

function buildSummary(userId) {
  const rows = listByUser(userId);
  const summary = { SEGURO: 0, 'RIESGO MEDIO': 0, 'ALTO RIESGO': 0 };

  rows.forEach((row) => {
    if (summary[row.last_level] !== undefined) {
      summary[row.last_level] += 1;
    }
  });

  return {
    total: rows.length,
    secure: summary['SEGURO'],
    medium: summary['RIESGO MEDIO'],
    high: summary['ALTO RIESGO'],
  };
}

module.exports = {
  listByUser,
  get,
  create,
  update,
  remove,
  analyzeOne,
  analyzeAll,
  listHistory,
  buildSummary,
};
