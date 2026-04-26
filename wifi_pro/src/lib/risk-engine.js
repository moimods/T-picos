function calculateScore(networkType, encryption, password) {
  let score = 0;

  if (networkType === 'Pública') {
    score += 40;
  }

  if (encryption === 'Ninguno') {
    score += 50;
  } else if (encryption === 'WEP') {
    score += 40;
  } else if (encryption === 'WPA') {
    score += 25;
  } else if (encryption === 'WPA2') {
    score += 10;
  }

  if (password && password.length < 8) {
    score += 20;
  }

  return Math.min(score, 100);
}

function classifyScore(score) {
  if (score >= 0 && score <= 30) {
    return { level: 'SEGURO', color: '#16a34a', indicator: '🟢' };
  }

  if (score >= 31 && score <= 70) {
    return { level: 'RIESGO MEDIO', color: '#f59e0b', indicator: '🟠' };
  }

  return { level: 'ALTO RIESGO', color: '#dc2626', indicator: '🔴' };
}

function analyzeNetwork(networkType, encryption, password) {
  const score = calculateScore(networkType, encryption, password);
  const { level, color, indicator } = classifyScore(score);
  return { score, level, color, indicator };
}

module.exports = {
  NETWORK_TYPES: ['Pública', 'Privada'],
  ENCRYPTION_TYPES: ['Ninguno', 'WEP', 'WPA', 'WPA2', 'WPA3'],
  analyzeNetwork,
};
