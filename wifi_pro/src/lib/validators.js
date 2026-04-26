const NETWORK_TYPES = ['Pública', 'Privada'];
const ENCRYPTION_TYPES = ['Ninguno', 'WEP', 'WPA', 'WPA2', 'WPA3'];

function validateLoginInput(username, password) {
  if (!String(username || '').trim() || !String(password || '').trim()) {
    return { ok: false, message: 'Usuario y contraseña son obligatorios.' };
  }

  return { ok: true, message: '' };
}

function validateRegisterInput(username, password, confirmPassword) {
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '');
  const cleanConfirm = String(confirmPassword || '');

  if (!cleanUsername || !cleanPassword || !cleanConfirm) {
    return { ok: false, message: 'Completa todos los campos para registrarte.' };
  }

  if (cleanUsername.length < 3) {
    return { ok: false, message: 'El usuario debe tener al menos 3 caracteres.' };
  }

  if (cleanPassword !== cleanConfirm) {
    return { ok: false, message: 'Las contraseñas no coinciden.' };
  }

  if (cleanPassword.length < 6) {
    return { ok: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  return { ok: true, message: '' };
}

function validateNetworkInput(name, networkType, encryption) {
  if (!String(name || '').trim()) {
    return { ok: false, message: 'El nombre de la red es obligatorio.' };
  }

  if (!NETWORK_TYPES.includes(networkType)) {
    return { ok: false, message: 'Selecciona un tipo de red válido.' };
  }

  if (!ENCRYPTION_TYPES.includes(encryption)) {
    return { ok: false, message: 'Selecciona un tipo de cifrado válido.' };
  }

  return { ok: true, message: '' };
}

module.exports = {
  NETWORK_TYPES,
  ENCRYPTION_TYPES,
  validateLoginInput,
  validateRegisterInput,
  validateNetworkInput,
};
