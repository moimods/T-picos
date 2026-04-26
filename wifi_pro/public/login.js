const statusMessage = document.getElementById('statusMessage');
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const rememberMe = document.getElementById('rememberMe');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

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

async function handleLogin() {
  try {
    const result = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value,
      }),
    });

    if (rememberMe.checked) {
      localStorage.setItem('wifiProRememberedUsername', loginUsername.value);
    } else {
      localStorage.removeItem('wifiProRememberedUsername');
    }

    setStatus(result.message);
    window.location.href = 'dashboard.html';
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function bootstrap() {
  const flash = localStorage.getItem('wifiProFlash');
  if (flash) {
    setStatus(flash);
    localStorage.removeItem('wifiProFlash');
  }

  const remembered = localStorage.getItem('wifiProRememberedUsername');
  if (remembered) {
    loginUsername.value = remembered;
    rememberMe.checked = true;
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleLogin();
  });

  document.getElementById('btnLogin').addEventListener('click', handleLogin);

  forgotPasswordLink.addEventListener('click', (event) => {
    event.preventDefault();
    setStatus('Función de recuperación en desarrollo. Contacta al administrador.', true);
  });

  try {
    const me = await api('/api/me');
    if (me.authenticated) {
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    setStatus(error.message, true);
  }
}

bootstrap();
