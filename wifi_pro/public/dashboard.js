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
const riskRecommendations = document.getElementById('riskRecommendations');

const sumTotal = document.getElementById('sumTotal');
const sumSafe = document.getElementById('sumSafe');
const sumMedium = document.getElementById('sumMedium');
const sumHigh = document.getElementById('sumHigh');

let selectedNetworkId = null;

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
    const message = payload.message || 'Error en la operación.';
    if (response.status === 401) {
      window.location.href = 'login.html';
      throw new Error('No autenticado. Redirigiendo...');
    }
    throw new Error(message);
  }

  return payload;
}

function updateUI(resultado) {
  const nivel = resultado.nivel || resultado.level || 'SEGURO';
  const score = Number(resultado.score || 0);
  const color = resultado.color || '#16a34a';
  const indicator = resultado.indicator || '🟢';
  const recomendaciones = Array.isArray(resultado.recomendaciones) ? resultado.recomendaciones : [];

  riskLevel.textContent = `${indicator} ${nivel}`;
  riskLevel.classList.remove('safe', 'medium', 'high');

  if (nivel === 'SEGURO') {
    riskLevel.classList.add('safe');
  } else if (nivel === 'MEDIO') {
    riskLevel.classList.add('medium');
  } else {
    riskLevel.classList.add('high');
  }

  riskLevel.style.color = color;
  riskScore.textContent = `${score} / 100`;
  riskFill.style.width = `${score}%`;
  riskFill.style.background = color;
  riskPercent.textContent = `${score}%`;

  if (riskRecommendations) {
    if (!recomendaciones.length) {
      riskRecommendations.innerHTML = '<li>Sin recomendaciones por ahora.</li>';
    } else {
      riskRecommendations.innerHTML = recomendaciones.map((item) => `<li>${item}</li>`).join('');
    }
  }
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
      updateUI(result.data);
      setStatus(result.message);
      await refreshDashboard();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById('btnAnalyzeAll').addEventListener('click', async () => {
    try {
      const result = await api('/api/networks/analyze-all', { method: 'POST' });
      if (!Array.isArray(result.data) || !result.data.length) {
        setStatus('No hay resultados para mostrar.', true);
        return;
      }

      const highest = result.data.reduce((prev, current) => (current.score > prev.score ? current : prev), result.data[0]);
      updateUI(highest);
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

  document.getElementById('btnLogout').addEventListener('click', async () => {
    try {
      await api('/api/logout', { method: 'POST' });
      setStatus('Sesión cerrada.');
      window.location.href = 'login.html';
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

async function bootstrap() {
  try {
    const me = await api('/api/me');
    if (!me.authenticated) {
      window.location.href = 'login.html';
      return;
    }

    usernameLabel.textContent = `Usuario: ${me.user.username}`;
    bindDashboard();
    await loadConfig();
    await refreshDashboard();

    const flash = localStorage.getItem('wifiProFlash');
    if (flash) {
      setStatus(flash);
      localStorage.removeItem('wifiProFlash');
    }
  } catch (error) {
    setStatus(error.message, true);
  }
}

bootstrap();
