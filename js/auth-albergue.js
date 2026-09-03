(() => {
  const { EMAIL_OK, announce, bindKeyboardOffset, setFieldError, bindOutlineFieldFocus, setSubmitLoading } = window.HuelliMvp || {};
  if (!window.HuelliMvp) return;

  const app = document.querySelector('.mvp-app');
  const liveStatus = document.getElementById('liveStatus');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  function goToPanel(message, submitBtn) {
    setSubmitLoading(submitBtn, true);
    announce(liveStatus, message);
    window.setTimeout(() => {
      window.location.href = 'panel-albergue.html';
    }, 420);
  }

  /* ——— Login ——— */
  if (loginForm) {
    const submitBtn = document.getElementById('loginSubmit');
    bindKeyboardOffset(app);
    bindOutlineFieldFocus(loginForm);

    function validateLogin() {
      let valid = true;
      const correoVal = document.getElementById('correo')?.value.trim() ?? '';
      const contrasena = document.getElementById('contrasena');

      if (!correoVal) {
        setFieldError('correo', 'Ingresa el correo del representante');
        valid = false;
      } else if (!EMAIL_OK.test(correoVal)) {
        setFieldError('correo', 'Ingresa un correo válido');
        valid = false;
      } else {
        setFieldError('correo', '');
      }

      if (!contrasena?.value.trim()) {
        setFieldError('contrasena', 'Ingresa la contraseña');
        valid = false;
      } else if (contrasena.value.trim().length < 6) {
        setFieldError('contrasena', 'Mínimo 6 caracteres');
        valid = false;
      } else {
        setFieldError('contrasena', '');
      }

      return valid;
    }

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateLogin()) {
        announce(liveStatus, 'Revisa los campos marcados en rojo');
        return;
      }
      goToPanel('Ingresando al panel', submitBtn);
    });
    return;
  }

  /* ——— Signup ——— */
  if (!signupForm) return;

  const submitBtn = document.getElementById('signupSubmit');
  bindKeyboardOffset(app);
  bindOutlineFieldFocus(signupForm);

  function required(id, emptyMessage) {
    const value = document.getElementById(id)?.value.trim() ?? '';
    if (!value) {
      setFieldError(id, emptyMessage);
      return false;
    }
    setFieldError(id, '');
    return true;
  }

  function validateSignup() {
    let valid = true;
    valid = required('albergue', 'Ingresa el nombre del albergue') && valid;
    valid = required('nombreRep', 'Ingresa el nombre') && valid;
    valid = required('apellidoRep', 'Ingresa el apellido') && valid;

    const correoVal = document.getElementById('correo')?.value.trim() ?? '';
    if (!correoVal) {
      setFieldError('correo', 'Ingresa el correo del representante');
      valid = false;
    } else if (!EMAIL_OK.test(correoVal)) {
      setFieldError('correo', 'Ingresa un correo válido');
      valid = false;
    } else {
      setFieldError('correo', '');
    }

    const pass = document.getElementById('contrasena')?.value ?? '';
    const confirm = document.getElementById('confirma')?.value ?? '';

    if (!pass.trim()) {
      setFieldError('contrasena', 'Crea una contraseña');
      valid = false;
    } else if (pass.trim().length < 6) {
      setFieldError('contrasena', 'Mínimo 6 caracteres');
      valid = false;
    } else {
      setFieldError('contrasena', '');
    }

    if (!confirm.trim()) {
      setFieldError('confirma', 'Confirma la contraseña');
      valid = false;
    } else if (pass !== confirm) {
      setFieldError('confirma', 'Las contraseñas no coinciden');
      valid = false;
    } else {
      setFieldError('confirma', '');
    }

    return valid;
  }

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateSignup()) {
      announce(liveStatus, 'Revisa los campos marcados en rojo');
      return;
    }
    goToPanel('Creando cuenta', submitBtn);
  });
})();
