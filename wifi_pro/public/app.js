const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const sessionInfo = document.getElementById('sessionInfo');
const usernameLabel = document.getElementById('usernameLabel');
const statusMessage = document.getElementById('statusMessage');

const networkName = document.getElementById('networkName');
const networkType = document.getElementById('networkType');
const networkEncryption = document.getElementById('networkEncryption');
const networkPassword = document.getElementById('networkPassword');
const tableBody = document.getElementById('networksTableBody');
const historyList = document.getElementById('historyList');

const riskLevel = document.getElementById('riskLevel');
const riskScore = document.getElementById('riskScore');
const riskFill = document.getElementById('riskFill');
const riskPercent = document.getElementById('riskPercent');

const sumTotal = document.getElementById('sumTotal');
const sumSafe = document.getElementById('sumSafe');
const sumMedium = document.getElementById('sumMedium');
const sumHigh = document.getElementById('sumHigh');

let selectedNetworkId = null;
let networksCache = [];

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', Boolean(isError));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || 'Error en la operación.');
  }
  return payload;
}

function renderResult(result) {
  riskLevel.textContent = `${result.indicator} ${result.level}`;
  riskLevel.classList.remove('safe', 'medium', 'high');
  if (result.level === 'SEGURO') {
    riskLevel.classList.add('safe');
  } else if (result.level === 'RIESGO MEDIO') {
    riskLevel.classList.add('medium');
  } else {
    riskLevel.classList.add('high');
  }
  riskLevel.style.color = result.color;
  riskScore.textContent = `${result.score} / 100`;
  riskFill.style.width = `${result.score}%`;
  riskFill.style.background = result.color;
  riskPercent.textContent = `${result.score}%`;
}

function clearForm() {
  selectedNetworkId = null;
  networkName.value = '';
  networkType.selectedIndex = 0;
  networkEncryption.selectedIndex = 0;
  networkPassword.value = '';
  Array.from(tableBody.querySelectorAll('tr')).forEach((row) => row.classList.remove('selected'));
}

async function loadConfig() {
  const { data } = await api('/api/config');
  networkType.innerHTML = data.networkTypes.map((item) => `<option>${item}</option>`).join('');
  networkEncryption.innerHTML = data.encryptionTypes.map((item) => `<option>${item}</option>`).join('');
  networkType.selectedIndex = 0;
  networkEncryption.selectedIndex = 3;
}

async function loadNetworks() {
  const { data } = await api('/api/networks');
  networksCache = data;
  tableBody.innerHTML = '';

  data.forEach((network) => {
    const row = document.createElement('tr');
    row.dataset.id = String(network.id);
    row.innerHTML = `
      <td>${network.name}</td>
      <td>${network.network_type}</td>
      <td>${network.encryption}</td>
      <td>${network.last_indicator || '🟢'}</td>
    `;

    row.addEventListener('click', async () => {
      selectedNetworkId = Number(network.id);
      networkName.value = network.name;
      networkType.value = network.network_type;
      networkEncryption.value = network.encryption;
      networkPassword.value = network.password || '';

      Array.from(tableBody.querySelectorAll('tr')).forEach((tr) => tr.classList.remove('selected'));
      row.classList.add('selected');

      await loadHistory();
    });

    tableBody.appendChild(row);
  });
}

async function loadSummary() {
  const { data } = await api('/api/summary');
  sumTotal.textContent = data.total;
  sumSafe.textContent = data.secure;
  sumMedium.textContent = data.medium;
  sumHigh.textContent = data.high;
}

async function loadHistory() {
  historyList.innerHTML = '';
  if (!selectedNetworkId) {
    const li = document.createElement('li');
    li.textContent = 'Sin selección de red.';
    historyList.appendChild(li);
    return;
  }

  const { data } = await api(`/api/networks/${selectedNetworkId}/history`);
  if (!data.length) {
    const li = document.createElement('li');
    li.textContent = 'Sin historial.';
    historyList.appendChild(li);
    return;
  }

  data.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.created_at} | ${item.indicator} ${item.score}/100`;
    historyList.appendChild(li);
  });
}

async function refreshDashboard() {
  await Promise.all([loadNetworks(), loadSummary(), loadHistory()]);
}

function bindAuth() {
  document.getElementById('btnRegister').addEventListener('click', async () => {
    try {
      const username = document.getElementById('registerUsername').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirm').value;
      const result = await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, confirmPassword }),
      });
      setStatus(result.message);
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnLogin').addEventListener('click', async () => {
    try {
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      const result = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      usernameLabel.textContent = `Usuario: ${result.user.username}`;
      authSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      sessionInfo.classList.remove('hidden');
      setStatus(result.message);
      await refreshDashboard();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnLogout').addEventListener('click', async () => {
    try {
      await api('/api/logout', { method: 'POST' });
      authSection.classList.remove('hidden');
      dashboardSection.classList.add('hidden');
      sessionInfo.classList.add('hidden');
      clearForm();
      setStatus('Sesión cerrada.');
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

function bindDashboard() {
  document.getElementById('btnAdd').addEventListener('click', async () => {
    try {
      const result = await api('/api/networks', {
        method: 'POST',
        body: JSON.stringify({
          name: networkName.value,
          networkType: networkType.value,
          encryption: networkEncryption.value,
          password: networkPassword.value,
        }),
      });
      setStatus(result.message);
      clearForm();
      await refreshDashboard();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnUpdate').addEventListener('click', async () => {
    if (!selectedNetworkId) {
      setStatus('Selecciona una red para editar.', true);
      return;
    }

    try {
      const result = await api(`/api/networks/${selectedNetworkId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: networkName.value,
          networkType: networkType.value,
          encryption: networkEncryption.value,
          password: networkPassword.value,
        }),
      });
      setStatus(result.message);
      await refreshDashboard();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnDelete').addEventListener('click', async () => {
    if (!selectedNetworkId) {
      setStatus('Selecciona una red para eliminar.', true);
      return;
    }

    try {
      const result = await api(`/api/networks/${selectedNetworkId}`, { method: 'DELETE' });
      setStatus(result.message);
      clearForm();
      await refreshDashboard();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnAnalyzeSelected').addEventListener('click', async () => {
    if (!selectedNetworkId) {
      setStatus('Selecciona una red para analizar.', true);
      return;
    }

    try {
      const result = await api(`/api/networks/${selectedNetworkId}/analyze`, { method: 'POST' });
      renderResult(result.data);
      setStatus(result.message);
      await refreshDashboard();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnAnalyzeAll').addEventListener('click', async () => {
    try {
      const result = await api('/api/networks/analyze-all', { method: 'POST' });
      const highest = result.data.reduce((prev, current) => (current.score > prev.score ? current : prev), result.data[0]);
      renderResult(highest);
      setStatus(result.message);
      await refreshDashboard();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnClear').addEventListener('click', () => {
    clearForm();
    setStatus('Formulario limpio.');
  });
}

async function bootstrap() {
  try {
    await loadConfig();
    bindAuth();
    bindDashboard();

    const me = await api('/api/me');
    if (me.authenticated) {
      usernameLabel.textContent = `Usuario: ${me.user.username}`;
      authSection.classList.add('hidden');
      dashboardSection.classList.remove('hidden');
      sessionInfo.classList.remove('hidden');
      await refreshDashboard();
    }
  } catch (error) {
    setStatus(error.message, true);
  }
}

bootstrap();
