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
        outline?.classList.add('is-active');
        window.requestAnimationFrame(() => {
          field.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        });
      });
      field.addEventListener('blur', () => {
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
    const key = String(codigo || '').toUpperCase();
    const entry = readTutors()[key];
    if (entry?.nombre) return entry;
    const catalogName = PET_CATALOG[key]?.tutor;
    if (catalogName) return { nombre: catalogName, contacto: PET_CATALOG[key].tutorContacto || '' };
    return null;
  }

  function setTutor(codigo, data) {
    const map = readTutors();
    if (!data?.nombre) delete map[codigo];
    else map[codigo] = data;
    writeTutors(map);
  }

  const PET_CATALOG = {
    'HU-0001': {
      codigo: 'HU-0001',
      nombre: 'Luna',
      tipo: 'Perro',
      edad: '8 meses',
      raza: 'Mestiza',
      sexo: 'Hembra',
      caracter: ['Tranquilo', 'Sociable'],
      cuentaCon: ['Desparasitación', 'Cartilla de vacunas'],
      albergue: 'Albergue ABC',
      foto: '../../assets/animales/luna.jpg',
      estado: 'en_albergue',
      notas: 'Sin alergias conocidas. Se lleva bien con gatos.',
    },
    'HU-0002': {
      codigo: 'HU-0002',
      nombre: 'Coco',
      tipo: 'Perro',
      edad: '3 meses',
      raza: 'Mestizo',
      sexo: 'Macho',
      caracter: ['Juguetón', 'Sociable'],
      cuentaCon: ['Cartilla de vacunas'],
      albergue: 'Albergue ABC',
      foto: '../../assets/animales/coco.jpg',
      estado: 'adoptado',
      tutor: 'Camila ABC',
      notas: 'Cartilla iniciada. Próxima vacuna en 2 semanas. Cachorro juguetón y sociable.',
    },
    'HU-0003': {
      codigo: 'HU-0003',
      nombre: 'Abeja',
      tipo: 'Perro',
      edad: '1 año',
      raza: 'Mestiza',
      sexo: 'Hembra',
      caracter: ['Juguetón', 'Sociable'],
      cuentaCon: ['Cartilla de vacunas', 'Esterilización'],
      albergue: 'Albergue ABC',
      foto: '../../assets/animales/abeja.jpg',
      estado: 'en_albergue',
      notas: 'Leve dermatitis controlada con dieta.',
    },
    'HU-0004': {
      codigo: 'HU-0004',
      nombre: 'Tony',
      tipo: 'Perro',
      edad: '1 año',
      raza: 'Labrador',
      sexo: 'Macho',
      caracter: ['Juguetón', 'Sociable'],
      cuentaCon: ['Desparasitación', 'Cartilla de vacunas'],
      albergue: 'Albergue ABC',
      foto: '../../assets/animales/tony.jpg',
      estado: 'en_albergue',
      notas: 'Energía alta; necesita paseos diarios.',
    },
  };

  function getPet(codigo) {
    return PET_CATALOG[String(codigo || '').toUpperCase()] || null;
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
    getPet,
  };
})();
