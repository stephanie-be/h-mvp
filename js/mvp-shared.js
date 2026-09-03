(() => {
  const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TUTOR_KEY = 'huelli.tutores';

  function announce(liveEl, message) {
    if (liveEl) liveEl.textContent = message;
  }

  function bindKeyboardOffset(app, factor = 0.25) {
    if (!window.visualViewport || !app) return;

    const update = () => {
      const viewport = window.visualViewport;
      const keyboardHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      const offset = keyboardHeight > 80 ? keyboardHeight * factor : 0;
      app.style.setProperty('--mvp-keyboard-offset', `${offset}px`);
      app.classList.toggle('mvp-keyboard-open', keyboardHeight > 80);
    };

    window.visualViewport.addEventListener('resize', update);
    window.visualViewport.addEventListener('scroll', update);
  }

  function setFieldError(id, message) {
    const field = document.getElementById(id);
    const error = document.querySelector(`[data-error-for="${id}"]`);
    if (field) field.classList.toggle('is-invalid', Boolean(message));
    if (error) {
      error.textContent = message || '';
      error.hidden = !message;
    }
  }

  function bindOutlineFieldFocus(form) {
    if (!form) return;
    form.querySelectorAll('.mvp-login-input').forEach((field) => {
      const wrapper = field.closest('.mvp-form-field');
      const outline = field.closest('.mvp-outline-field');

      field.addEventListener('focus', () => {
        wrapper?.classList.add('is-focused');
        outline?.classList.add('is-active');
        window.requestAnimationFrame(() => {
          field.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        });
      });
      field.addEventListener('blur', () => {
        wrapper?.classList.remove('is-focused');
        outline?.classList.remove('is-active');
      });
    });
  }

  function setSubmitLoading(btn, loading) {
    btn?.classList.toggle('is-loading', loading);
    btn?.setAttribute('aria-busy', loading ? 'true' : 'false');
    btn?.toggleAttribute('disabled', loading);
  }

  function readTutors() {
    try {
      return JSON.parse(sessionStorage.getItem(TUTOR_KEY) || '{}') || {};
    } catch {
      return {};
    }
  }

  function writeTutors(map) {
    sessionStorage.setItem(TUTOR_KEY, JSON.stringify(map));
  }

  function getTutor(codigo) {
    const entry = readTutors()[codigo];
    if (!entry || !entry.nombre) return null;
    return entry;
  }

  function setTutor(codigo, data) {
    const map = readTutors();
    if (!data?.nombre) delete map[codigo];
    else map[codigo] = data;
    writeTutors(map);
  }

  window.HuelliMvp = {
    EMAIL_OK,
    announce,
    bindKeyboardOffset,
    setFieldError,
    bindOutlineFieldFocus,
    setSubmitLoading,
    getTutor,
    setTutor,
  };
})();
