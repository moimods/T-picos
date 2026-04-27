const statusMessage = document.getElementById('statusMessage');
const registerForm = document.getElementById('registerForm');
const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerConfirm = document.getElementById('registerConfirm');
const btnRegister = document.getElementById('btnRegister');

function setStatus(message, isError = false) {
  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', Boolean(isError));
}

function setRegisterLoading(isLoading) {
  if (!btnRegister) {
    return;
  }

  btnRegister.disabled = Boolean(isLoading);
  btnRegister.textContent = isLoading ? 'Cargando...' : 'Registrarse';
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

async function handleRegister() {
  setRegisterLoading(true);

  try {
    const result = await api('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        username: registerUsername.value,
        password: registerPassword.value,
        confirmPassword: registerConfirm.value,
      }),
    });

    localStorage.setItem('wifiProFlash', result.message);
    window.location.href = 'login.html';
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    setRegisterLoading(false);
  }
}

async function bootstrap() {
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleRegister();
    });
  }

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
