const statusMessage = document.getElementById('statusMessage');
const registerForm = document.getElementById('registerForm');
const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerConfirm = document.getElementById('registerConfirm');

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

async function handleRegister() {
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
  }
}

async function bootstrap() {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleRegister();
  });

  document.getElementById('btnRegister').addEventListener('click', handleRegister);

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
