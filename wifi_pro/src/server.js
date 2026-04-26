const path = require('path');
const express = require('express');
const session = require('express-session');

const { initializeStorage } = require('./lib/storage');
const { NETWORK_TYPES, ENCRYPTION_TYPES, validateLoginInput, validateRegisterInput, validateNetworkInput } = require('./lib/validators');
const userService = require('./services/user-service');
const networkService = require('./services/network-service');

initializeStorage();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'wifi-pro-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  })
);

app.use(express.static(path.resolve(__dirname, '../public')));

function authRequired(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ ok: false, message: 'No autenticado.' });
  }
  return next();
}

app.get('/api/config', (_req, res) => {
  res.json({ ok: true, data: { networkTypes: NETWORK_TYPES, encryptionTypes: ENCRYPTION_TYPES } });
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.json({ ok: true, authenticated: false });
  }

  return res.json({
    ok: true,
    authenticated: true,
    user: { id: req.session.user.id, username: req.session.user.username },
  });
});

app.post('/api/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  const validation = validateRegisterInput(username, password, confirmPassword);
  if (!validation.ok) {
    return res.status(400).json({ ok: false, message: validation.message });
  }

  const result = await userService.register(username, password);
  if (!result.ok) {
    return res.status(400).json({ ok: false, message: result.message });
  }

  return res.json({ ok: true, message: result.message });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const validation = validateLoginInput(username, password);
  if (!validation.ok) {
    return res.status(400).json({ ok: false, message: validation.message });
  }

  const result = await userService.authenticate(username, password);
  if (!result.ok) {
    return res.status(401).json({ ok: false, message: result.message });
  }

  req.session.user = { id: result.user.id, username: result.user.username };
  return res.json({ ok: true, message: result.message, user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, message: 'Sesión cerrada.' });
  });
});

app.get('/api/networks', authRequired, (req, res) => {
  const rows = networkService.listByUser(req.session.user.id);
  res.json({ ok: true, data: rows });
});

app.post('/api/networks', authRequired, (req, res) => {
  const { name, networkType, encryption, password } = req.body;
  const validation = validateNetworkInput(name, networkType, encryption);
  if (!validation.ok) {
    return res.status(400).json({ ok: false, message: validation.message });
  }

  const created = networkService.create(req.session.user.id, name, networkType, encryption, password || '');
  res.json({ ok: true, message: 'Red agregada correctamente.', data: created });
});

app.put('/api/networks/:id', authRequired, (req, res) => {
  const networkId = Number(req.params.id);
  const { name, networkType, encryption, password } = req.body;
  const validation = validateNetworkInput(name, networkType, encryption);
  if (!validation.ok) {
    return res.status(400).json({ ok: false, message: validation.message });
  }

  const updated = networkService.update(networkId, req.session.user.id, name, networkType, encryption, password || '');
  if (!updated) {
    return res.status(404).json({ ok: false, message: 'No se pudo actualizar la red seleccionada.' });
  }

  return res.json({ ok: true, message: 'Red actualizada correctamente.', data: updated });
});

app.delete('/api/networks/:id', authRequired, (req, res) => {
  const networkId = Number(req.params.id);
  const deleted = networkService.remove(networkId, req.session.user.id);
  if (!deleted) {
    return res.status(404).json({ ok: false, message: 'No se pudo eliminar la red seleccionada.' });
  }

  return res.json({ ok: true, message: 'Red eliminada correctamente.' });
});

app.post('/api/networks/:id/analyze', authRequired, (req, res) => {
  const networkId = Number(req.params.id);
  const analyzed = networkService.analyzeOne(networkId, req.session.user.id);
  if (!analyzed.ok) {
    return res.status(400).json({ ok: false, message: analyzed.message });
  }

  return res.json({ ok: true, message: analyzed.message, data: analyzed.result });
});

app.post('/api/networks/analyze-all', authRequired, (req, res) => {
  const analyzed = networkService.analyzeAll(req.session.user.id);
  if (!analyzed.ok) {
    return res.status(400).json({ ok: false, message: analyzed.message });
  }

  return res.json({ ok: true, message: analyzed.message, data: analyzed.results });
});

app.get('/api/networks/:id/history', authRequired, (req, res) => {
  const networkId = Number(req.params.id);
  const history = networkService.listHistory(networkId, req.session.user.id, 10);
  return res.json({ ok: true, data: history });
});

app.get('/api/summary', authRequired, (req, res) => {
  const summary = networkService.buildSummary(req.session.user.id);
  return res.json({ ok: true, data: summary });
});

function listen(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));

    server.on('error', (error) => {
      reject(error);
    });
  });
}

async function startServer() {
  const basePort = Number(PORT) || 3000;

  for (let currentPort = basePort; currentPort < basePort + 10; currentPort += 1) {
    try {
      await listen(currentPort);
      // eslint-disable-next-line no-console
      console.log(`WiFi Pro Node.js ejecutándose en http://localhost:${currentPort}`);
      return;
    } catch (error) {
      if (error.code !== 'EADDRINUSE') {
        throw error;
      }
    }
  }

  throw new Error(`No se pudo iniciar el servidor. Ningún puerto libre entre ${basePort} y ${basePort + 9}.`);
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error.message);
  process.exit(1);
});
