const NORMALIZE_TYPE = {
  publica: 'publica',
  publicaa: 'publica',
  'pública': 'publica',
  publica_: 'publica',
  privada: 'privada',
};

const NORMALIZE_ENCRYPTION = {
  none: 'none',
  ninguno: 'none',
  wep: 'wep',
  wpa: 'wpa',
  wpa2: 'wpa2',
  wpa3: 'wpa3',
};

function normalizeType(value) {
  const clean = String(value || '').trim().toLowerCase();
  if (clean === 'publica' || clean === 'pública') {
    return 'publica';
  }
  if (clean === 'privada') {
    return 'privada';
  }
  return NORMALIZE_TYPE[clean] || clean;
}

function normalizeEncryption(value) {
  const clean = String(value || '').trim().toLowerCase();
  return NORMALIZE_ENCRYPTION[clean] || clean;
}

function normalizarRed(red) {
  return {
    nombre: String(red?.nombre || red?.name || '').trim(),
    tipo: normalizeType(red?.tipo || red?.network_type || red?.networkType),
    cifrado: normalizeEncryption(red?.cifrado || red?.encryption),
    password: String(red?.password || ''),
  };
}

function calcularRiesgo(red) {
  const input = normalizarRed(red);
  let score = 0;

  if (input.tipo === 'publica') {
    score += 30;
  }

  if (input.cifrado === 'none') {
    score += 40;
  } else if (input.cifrado === 'wep') {
    score += 30;
  } else if (input.cifrado === 'wpa') {
    score += 20;
  } else if (input.cifrado === 'wpa2') {
    score += 10;
  }

  if (!input.password) {
    score += 30;
  } else if (input.password.length < 8) {
    score += 20;
  }

  if (/free|wifi|public/i.test(input.nombre)) {
    score += 20;
  }

  return Math.min(score, 100);
}

function clasificarRiesgo(score) {
  const safeScore = Number(score) || 0;
  if (safeScore <= 39) {
    return 'SEGURO';
  }
  if (safeScore <= 69) {
    return 'MEDIO';
  }
  return 'ALTO';
}

function obtenerColor(score) {
  const nivel = clasificarRiesgo(score);
  if (nivel === 'SEGURO') {
    return '#16a34a';
  }
  if (nivel === 'MEDIO') {
    return '#f59e0b';
  }
  return '#dc2626';
}

function obtenerIndicador(score) {
  const nivel = clasificarRiesgo(score);
  if (nivel === 'SEGURO') {
    return '🟢';
  }
  if (nivel === 'MEDIO') {
    return '🟠';
  }
  return '🔴';
}

function generarRecomendaciones(red, score) {
  const input = normalizarRed(red);
  const recomendaciones = [];

  if (input.cifrado === 'none' || input.cifrado === 'wep' || input.cifrado === 'wpa') {
    recomendaciones.push('Usar cifrado WPA2 o superior.');
  }

  if (input.tipo === 'publica' && (input.cifrado === 'none' || input.cifrado === 'wep')) {
    recomendaciones.push('Evitar redes publicas sin proteccion.');
  }

  if (!input.password || input.password.length < 8) {
    recomendaciones.push('Mejorar la contrasena con al menos 8 caracteres.');
  }

  if (/free|wifi|public/i.test(input.nombre)) {
    recomendaciones.push('Verificar autenticidad de la red antes de conectarte.');
  }

  if (!recomendaciones.length && score <= 39) {
    recomendaciones.push('Configuracion correcta: mantén monitoreo periodico.');
  }

  return recomendaciones;
}

function analizarRed(red) {
  const input = normalizarRed(red);
  const score = calcularRiesgo(input);
  const nivel = clasificarRiesgo(score);
  const color = obtenerColor(score);
  const recomendaciones = generarRecomendaciones(input, score);
  const indicator = obtenerIndicador(score);

  return {
    score,
    nivel,
    color,
    recomendaciones,
    level: nivel,
    indicator,
  };
}

function analizarTodas(redes) {
  const items = Array.isArray(redes) ? redes : [];
  const resultados = items.map((red) => {
    const resultado = analizarRed(red);
    return { red: normalizarRed(red), ...resultado };
  });

  const resumen = {
    total: resultados.length,
    seguras: resultados.filter((item) => item.nivel === 'SEGURO').length,
    medias: resultados.filter((item) => item.nivel === 'MEDIO').length,
    altas: resultados.filter((item) => item.nivel === 'ALTO').length,
  };

  return { resultados, resumen };
}

// Compatibilidad con flujo existente en servicios.
function analyzeNetwork(networkType, encryption, password, name = '') {
  return analizarRed({
    nombre: name,
    tipo: networkType,
    cifrado: encryption,
    password,
  });
}

module.exports = {
  NETWORK_TYPES: ['Pública', 'Privada'],
  ENCRYPTION_TYPES: ['Ninguno', 'WEP', 'WPA', 'WPA2', 'WPA3'],
  calcularRiesgo,
  clasificarRiesgo,
  obtenerColor,
  generarRecomendaciones,
  analizarRed,
  analizarTodas,
  analyzeNetwork,
};
