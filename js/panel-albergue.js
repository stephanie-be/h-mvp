(() => {
  const { bindKeyboardOffset, getTutor, setTutor } = window.HuelliMvp || {};
  const app = document.querySelector('.mvp-app');
  const shelterList = document.querySelector('[data-pet-list="shelter"]');
  const adoptedList = document.querySelector('[data-pet-list="adopted"]');
  const shelterEmpty = document.querySelector('[data-shelter-empty]');
  const adoptedEmpty = document.querySelector('[data-adopted-empty]');
  const live = document.querySelector('[data-panel-live]');
  const modal = document.getElementById('tutorModal');
  const form = document.getElementById('tutorForm');
  const titleEl = document.getElementById('tutorModalTitle');
  const nombreInput = document.getElementById('tutorNombre');
  const contactoInput = document.getElementById('tutorContacto');

  if (!window.HuelliMvp) return;

  let activeItem = null;

  bindKeyboardOffset(app);

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function refreshTutorUi(item) {
    const codigo = item.dataset.codigo;
    const adopted = item.dataset.status === 'adopted';
    const tutorBtn = item.querySelector('[data-tutor-btn]');
    const editBtn = item.querySelector('[data-edit-btn]');
    const tutor = getTutor(codigo);

    if (editBtn) editBtn.hidden = adopted;

    if (tutorBtn) {
      tutorBtn.hidden = !adopted;
      tutorBtn.textContent = tutor ? 'Ver tutor' : 'Asignar tutor';
    }
  }

  function refreshAllTutorUi() {
    document.querySelectorAll('[data-pet-item]').forEach(refreshTutorUi);
  }

  function updateEmptyStates() {
    const shelterCount = shelterList?.querySelectorAll('[data-pet-item]').length ?? 0;
    const adoptedCount = adoptedList?.querySelectorAll('[data-pet-item]').length ?? 0;
    if (shelterEmpty) shelterEmpty.hidden = shelterCount > 0;
    if (adoptedEmpty) adoptedEmpty.hidden = adoptedCount > 0;
  }

  function setItemStatus(item, status) {
    const select = item.querySelector('[data-status-select]');
    item.dataset.status = status;
    if (select && select.value !== status) select.value = status;
  }

  function animateArrival(item) {
    if (prefersReducedMotion()) return;
    item.classList.remove('is-arriving');
    void item.offsetWidth;
    item.classList.add('is-arriving');
    item.addEventListener('animationend', () => {
      item.classList.remove('is-arriving');
    }, { once: true });
  }

  function applyStatus(item, status) {
    setItemStatus(item, status);
    const target = status === 'adopted' ? adoptedList : shelterList;
    if (target && item.parentElement !== target) {
      target.appendChild(item);
      animateArrival(item);
    }
    refreshTutorUi(item);
    updateEmptyStates();

    const name = item.querySelector('h3')?.textContent || 'Animal';
    if (live) {
      live.textContent = status === 'adopted'
        ? `${name} se movió a Adoptados.`
        : `${name} se movió a En albergue.`;
    }
  }

  function openTutorModal(item) {
    activeItem = item;
    const codigo = item.dataset.codigo;
    const tutor = getTutor(codigo);
    if (titleEl) titleEl.textContent = tutor ? 'Ver tutor' : 'Asignar tutor';
    if (nombreInput) nombreInput.value = tutor?.nombre || '';
    if (contactoInput) contactoInput.value = tutor?.contacto || '';
    if (modal) modal.hidden = false;
    document.body.classList.add('mvp-modal-open');
    nombreInput?.focus();
  }

  function closeTutorModal() {
    activeItem = null;
    if (modal) modal.hidden = true;
    document.body.classList.remove('mvp-modal-open');
    form?.reset();
  }

  document.querySelectorAll('[data-status-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const item = select.closest('[data-pet-item]');
      if (!item) return;
      applyStatus(item, select.value);
    });
  });

  document.querySelectorAll('[data-tutor-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-pet-item]');
      if (!item || item.dataset.status !== 'adopted') return;
      openTutorModal(item);
    });
  });

  modal?.querySelectorAll('[data-tutor-close]').forEach((el) => {
    el.addEventListener('click', closeTutorModal);
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!activeItem) return;
    const nombre = nombreInput?.value.trim() || '';
    if (!nombre) {
      nombreInput?.focus();
      return;
    }
    const codigo = activeItem.dataset.codigo;
    const contacto = contactoInput?.value.trim() || '';
    setTutor(codigo, { nombre, contacto });
    refreshTutorUi(activeItem);
    const petName = activeItem.querySelector('h3')?.textContent || 'Animal';
    if (live) live.textContent = `Tutor de ${petName} actualizado.`;
    closeTutorModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hidden) closeTutorModal();
  });

  refreshAllTutorUi();
  updateEmptyStates();
})();
