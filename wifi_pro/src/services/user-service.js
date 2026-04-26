const bcrypt = require('bcryptjs');
const { USERS_FILE, readJson, writeJson, nextId } = require('../lib/storage');

function loadUsers() {
  return readJson(USERS_FILE, { users: [] });
}

function saveUsers(payload) {
  writeJson(USERS_FILE, payload);
}

function findByUsername(username) {
  const data = loadUsers();
  return data.users.find((user) => user.username.toLowerCase() === String(username || '').trim().toLowerCase()) || null;
}

async function register(username, password) {
  const data = loadUsers();

  if (findByUsername(username)) {
    return { ok: false, message: 'El usuario ya existe.', user: null };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nextId(data.users),
    username: String(username).trim(),
    password_hash: passwordHash,
    created_at: new Date().toISOString().slice(0, 19),
  };

  data.users.push(user);
  saveUsers(data);
  return { ok: true, message: 'Usuario registrado correctamente.', user };
}

async function authenticate(username, password) {
  const user = findByUsername(username);
  if (!user) {
    return { ok: false, message: 'Usuario o contraseña inválidos.', user: null };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { ok: false, message: 'Usuario o contraseña inválidos.', user: null };
  }

  return { ok: true, message: 'Inicio de sesión exitoso.', user };
}

module.exports = {
  register,
  authenticate,
};
