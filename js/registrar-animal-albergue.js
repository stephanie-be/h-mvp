(() => {
  const app = document.querySelector('.mvp-app');
  const form = document.getElementById('registroForm');
  const formPanel = document.getElementById('registroFormPanel');
  const successPanel = document.getElementById('registroSuccessPanel');
  const photoInput = document.getElementById('fotoInput');
  const photoTrigger = document.getElementById('fotoTrigger');
  const photoPreview = document.getElementById('fotoPreview');
  const photoPlaceholder = document.getElementById('fotoPlaceholder');
  const photoLink = photoTrigger?.querySelector('.mvp-photo-link');
  const progressPanel = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const progressText = document.getElementById('progressText');
  const submitBtn = document.getElementById('submitBtn');
  const successCode = document.getElementById('successCode');
  const resetBtn = document.getElementById('resetBtn');
  const viewPublicBtn = document.getElementById('viewPublicBtn');
  const liveStatus = document.getElementById('liveStatus');

  const cropModal = document.getElementById('fotoCropModal');
  const cropViewport = document.getElementById('fotoCropViewport');
  const cropImage = document.getElementById('fotoCropImage');
  const cropCancel = document.getElementById('fotoCropCancel');
  const cropConfirm = document.getElementById('fotoCropConfirm');

  if (!form || !formPanel || !successPanel) return;

  const OUTPUT_SIZE = 960;
  const EDITABLE_CODIGO = 'HU-0001';
  const editCodigo = (new URLSearchParams(window.location.search).get('edit') || '').toUpperCase();
  const editPet = editCodigo === EDITABLE_CODIGO ? window.HuelliMvp?.getPet(EDITABLE_CODIGO) : null;

  let confirmedPreviewUrl = '';
  let confirmedFile = null;
  let hasConfirmedPhoto = false;

  let pendingSourceUrl = '';
  let cropNaturalW = 0;
  let cropNaturalH = 0;
  let panX = 0;
  let panY = 0;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginPanX = 0;
  let dragOriginPanY = 0;
  let cropBusy = false;

  function announce(message) {
    window.HuelliMvp?.announce(liveStatus, message);
  }

  function scrollFieldIntoView(element) {
    if (!element) return;
    window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  }

  function bindFieldFocusHandlers() {
    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('focus', () => {
        scrollFieldIntoView(field);
      });
    });
  }

  function getChoiceGroup(name) {
    return form.querySelector(`[data-choice-group="${name}"]`);
  }

  function getSelectedChips(name) {
    const group = getChoiceGroup(name);
    return [...(group?.querySelectorAll('.choice-chip.is-selected') || [])];
  }

  function resetChoiceChips() {
    form.querySelectorAll('.choice-chip').forEach((chip) => {
      chip.classList.remove('is-selected');
      chip.setAttribute('aria-pressed', 'false');
    });
  }

  function bindChoiceChips() {
    form.querySelectorAll('[data-choice-group]').forEach((group) => {
      const multi = group.dataset.choiceMode === 'multi';
      group.querySelectorAll('.choice-chip').forEach((button) => {
        button.addEventListener('click', () => {
          if (multi) {
            const selected = !button.classList.contains('is-selected');
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
          } else {
            group.querySelectorAll('.choice-chip').forEach((item) => {
              const selected = item === button;
              item.classList.toggle('is-selected', selected);
              item.setAttribute('aria-pressed', selected ? 'true' : 'false');
            });
          }

          const groupName = group.dataset.choiceGroup;
          if (groupName) setFieldError(groupName, '');
        });
      });
    });
  }

  function revokeUrl(url) {
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
  }

  function clearPhotoInput() {
    if (photoInput) photoInput.value = '';
  }

  function assignFileToInput(file) {
    if (!photoInput || !file) return false;
    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      photoInput.files = transfer.files;
      return photoInput.files?.length > 0;
    } catch {
      return false;
    }
  }

  function updatePhotoLink() {
    if (!photoLink) return;
    photoLink.textContent = hasConfirmedPhoto
      ? 'Cambiar foto'
      : 'Asegúrate que el rostro esté centrado y bien iluminado';
  }

  function showConfirmedPreview(url) {
    if (photoPreview) {
      photoPreview.src = url;
      photoPreview.hidden = false;
    }
    photoPlaceholder?.setAttribute('hidden', '');
    updatePhotoLink();
  }

  function clearConfirmedPreview() {
    hasConfirmedPhoto = false;
    confirmedFile = null;
    if (confirmedPreviewUrl) {
      revokeUrl(confirmedPreviewUrl);
      confirmedPreviewUrl = '';
    }
    if (photoPreview) {
      photoPreview.removeAttribute('src');
      photoPreview.hidden = true;
    }
    photoPlaceholder?.removeAttribute('hidden');
    clearPhotoInput();
    updatePhotoLink();
  }

  function getViewportSize() {
    return cropViewport?.clientWidth || 240;
  }

  function getDisplayScale() {
    const size = getViewportSize();
    if (!cropNaturalW || !cropNaturalH || !size) return 1;
    return Math.max(size / cropNaturalW, size / cropNaturalH);
  }

  function clampPan() {
    const size = getViewportSize();
    const displayScale = getDisplayScale();
    const displayW = cropNaturalW * displayScale;
    const displayH = cropNaturalH * displayScale;
    const maxX = Math.max(0, (displayW - size) / 2);
    const maxY = Math.max(0, (displayH - size) / 2);
    panX = Math.min(maxX, Math.max(-maxX, panX));
    panY = Math.min(maxY, Math.max(-maxY, panY));
  }

  function applyCropTransform() {
    if (!cropImage) return;
    const size = getViewportSize();
    const displayScale = getDisplayScale();
    const displayW = cropNaturalW * displayScale;
    const displayH = cropNaturalH * displayScale;
    const left = size / 2 + panX - displayW / 2;
    const top = size / 2 + panY - displayH / 2;
    cropImage.style.width = `${cropNaturalW}px`;
    cropImage.style.height = `${cropNaturalH}px`;
    cropImage.style.transform = `translate(${left}px, ${top}px) scale(${displayScale})`;
  }

  function openCropModal() {
    if (!cropModal) return;
    cropModal.hidden = false;
    document.body.classList.add('mvp-modal-open');
    announce('Arrastra para centrar el rostro');
    window.requestAnimationFrame(() => {
      clampPan();
      applyCropTransform();
      cropConfirm?.focus();
    });
  }

  function closeCropModal() {
    if (dragPointerId !== null && cropViewport) {
      try {
        cropViewport.releasePointerCapture(dragPointerId);
      } catch {
        /* ignore */
      }
    }
    dragPointerId = null;
    cropViewport?.classList.remove('is-dragging');

    if (cropModal) cropModal.hidden = true;
    document.body.classList.remove('mvp-modal-open');

    if (pendingSourceUrl) {
      revokeUrl(pendingSourceUrl);
      pendingSourceUrl = '';
    }
    if (cropImage) {
      cropImage.removeAttribute('src');
      cropImage.style.transform = '';
    }
  }

  function restorePreviousOrClear() {
    if (hasConfirmedPhoto && confirmedPreviewUrl) {
      showConfirmedPreview(confirmedPreviewUrl);
      if (confirmedFile) assignFileToInput(confirmedFile);
      else clearPhotoInput();
      return;
    }
    clearConfirmedPreview();
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar la imagen'));
      };
      img.src = url;
    });
  }

  async function openCropForFile(file) {
    if (!file || !cropImage || !cropViewport) return;

    try {
      const { img, url } = await loadImageFromFile(file);
      if (pendingSourceUrl) revokeUrl(pendingSourceUrl);
      pendingSourceUrl = url;
      cropNaturalW = img.naturalWidth || img.width;
      cropNaturalH = img.naturalHeight || img.height;
      panX = 0;
      panY = 0;
      cropImage.src = url;
      openCropModal();
    } catch {
      announce('No se pudo abrir la foto. Intenta con otra.');
      clearPhotoInput();
      restorePreviousOrClear();
    }
  }

  function exportCroppedFile() {
    const size = getViewportSize();
    const displayScale = getDisplayScale();
    const sourceSize = size / displayScale;
    const sx = cropNaturalW / 2 - panX / displayScale - sourceSize / 2;
    const sy = cropNaturalH / 2 - panY / displayScale - sourceSize / 2;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx || !cropImage) return Promise.reject(new Error('Canvas no disponible'));

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(
      cropImage,
      sx,
      sy,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('No se pudo generar la foto'));
            return;
          }
          const baseName = (photoInput?.files?.[0]?.name || 'animal').replace(/\.[^.]+$/, '');
          resolve(new File([blob], `${baseName}-ajuste.jpg`, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.9
      );
    });
  }

  function selectChipValues(groupName, values) {
    const wanted = new Set((values || []).filter(Boolean));
    const group = getChoiceGroup(groupName);
    group?.querySelectorAll('.choice-chip').forEach((button) => {
      const selected = wanted.has(button.dataset.value);
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function parseEdad(edad) {
    const text = String(edad || '').toLowerCase();
    const yearMatch = text.match(/(\d+)\s*años?/);
    const monthMatch = text.match(/(\d+)\s*meses?/);
    return {
      anios: yearMatch ? yearMatch[1] : '',
      meses: monthMatch ? monthMatch[1] : '',
    };
  }

  function applyExistingPhoto(src, alt) {
    hasConfirmedPhoto = true;
    confirmedFile = null;
    confirmedPreviewUrl = src || '';
    if (photoPreview) photoPreview.alt = alt || '';
    showConfirmedPreview(src);
  }

  function applyEditPet(pet) {
    const title = document.querySelector('.mvp-registro .mvp-sheet-title');
    const subtitle = document.querySelector('.mvp-registro .mvp-sheet-subtitle');
    const submitText = document.getElementById('submitLabelText');

    if (title) title.textContent = 'Editar animal';
    if (subtitle) subtitle.textContent = `Actualiza los datos de ${pet.nombre}`;
    if (submitText) submitText.textContent = 'Guardar cambios';
    document.title = `Editar animal · ${pet.nombre} · Huelli MVP`;

    const nombre = document.getElementById('nombre');
    const raza = document.getElementById('raza');
    const notas = document.getElementById('notas');
    if (nombre) nombre.value = pet.nombre || '';
    if (raza) raza.value = pet.raza || '';
    if (notas) notas.value = pet.notas || '';

    selectChipValues('tipo', pet.tipo ? [pet.tipo] : []);
    selectChipValues('sexo', pet.sexo ? [pet.sexo] : []);
    selectChipValues('caracter', pet.caracter);
    selectChipValues('cuentoCon', pet.cuentaCon);

    const { anios, meses } = parseEdad(pet.edad);
    const edadAnios = document.getElementById('edadAnios');
    const edadMeses = document.getElementById('edadMeses');
    if (edadAnios) edadAnios.value = anios;
    if (edadMeses) edadMeses.value = meses;

    if (pet.foto) applyExistingPhoto(pet.foto, pet.nombre);
  }

  window.HuelliMvp?.bindKeyboardOffset(app);
  bindFieldFocusHandlers();
  bindChoiceChips();
  if (editPet) applyEditPet(editPet);
  updatePhotoLink();

  photoTrigger?.addEventListener('click', () => photoInput?.click());

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) return;

    const photoError = document.getElementById('fotoError');
    if (photoError) photoError.hidden = true;

    openCropForFile(file);
  });

  cropCancel?.addEventListener('click', () => {
    closeCropModal();
    restorePreviousOrClear();
    announce(hasConfirmedPhoto ? 'Se mantuvo la foto anterior' : 'Foto cancelada');
  });

  cropModal?.querySelector('[data-crop-close]')?.addEventListener('click', () => {
    closeCropModal();
    restorePreviousOrClear();
  });

  cropConfirm?.addEventListener('click', async () => {
    if (cropBusy || !cropImage?.src) return;
    cropBusy = true;
    cropConfirm.disabled = true;
    cropCancel && (cropCancel.disabled = true);

    try {
      const file = await exportCroppedFile();
      const previewUrl = URL.createObjectURL(file);

      if (confirmedPreviewUrl) revokeUrl(confirmedPreviewUrl);
      confirmedPreviewUrl = previewUrl;
      confirmedFile = file;
      hasConfirmedPhoto = true;
      assignFileToInput(file);
      showConfirmedPreview(previewUrl);
      closeCropModal();

      const photoError = document.getElementById('fotoError');
      if (photoError) photoError.hidden = true;
      announce('Foto lista');
    } catch {
      announce('No se pudo guardar el ajuste. Intenta de nuevo.');
    } finally {
      cropBusy = false;
      cropConfirm.disabled = false;
      if (cropCancel) cropCancel.disabled = false;
    }
  });

  cropViewport?.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOriginPanX = panX;
    dragOriginPanY = panY;
    cropViewport.classList.add('is-dragging');
    cropViewport.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  cropViewport?.addEventListener('pointermove', (event) => {
    if (dragPointerId !== event.pointerId) return;
    panX = dragOriginPanX + (event.clientX - dragStartX);
    panY = dragOriginPanY + (event.clientY - dragStartY);
    clampPan();
    applyCropTransform();
  });

  function endDrag(event) {
    if (dragPointerId !== event.pointerId) return;
    dragPointerId = null;
    cropViewport?.classList.remove('is-dragging');
    try {
      cropViewport?.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  cropViewport?.addEventListener('pointerup', endDrag);
  cropViewport?.addEventListener('pointercancel', endDrag);

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!cropModal || cropModal.hidden) return;
    event.preventDefault();
    closeCropModal();
    restorePreviousOrClear();
  });

  function setFieldError(id, message) {
    const field = document.getElementById(id);
    const error = document.querySelector(`[data-error-for="${id}"]`);
    const wrapper = error?.closest('.mvp-form-field') || field?.closest('.mvp-form-field');

    if (field) field.classList.toggle('is-invalid', Boolean(message));
    if (id === 'edad') {
      document.getElementById('edadAnios')?.classList.toggle('is-invalid', Boolean(message));
      document.getElementById('edadMeses')?.classList.toggle('is-invalid', Boolean(message));
    }

    const chipGroup = wrapper?.querySelector('.registro-choice-chips');
    chipGroup?.setAttribute('aria-invalid', message ? 'true' : 'false');
    wrapper?.classList.toggle('is-invalid', Boolean(message));

    if (error) {
      error.textContent = message || '';
      error.hidden = !message;
    }

    return wrapper || field;
  }

  function isAgeFilled() {
    const years = document.getElementById('edadAnios')?.value.trim() ?? '';
    const months = document.getElementById('edadMeses')?.value.trim() ?? '';
    return years !== '' || months !== '';
  }

  function validateAgeValues() {
    const yearsField = document.getElementById('edadAnios');
    const monthsField = document.getElementById('edadMeses');
    const years = yearsField?.value.trim() ?? '';
    const months = monthsField?.value.trim() ?? '';

    if (years !== '') {
      const yearsNum = Number(years);
      if (!Number.isFinite(yearsNum) || yearsNum < 0 || yearsNum > 30) {
        return 'Años entre 0 y 30';
      }
    }

    if (months !== '') {
      const monthsNum = Number(months);
      if (!Number.isFinite(monthsNum) || monthsNum < 0 || monthsNum > 11) {
        return 'Meses entre 0 y 11';
      }
    }

    return '';
  }

  function hasPhoto() {
    return hasConfirmedPhoto || Boolean(photoInput?.files?.length);
  }

  function validateForm() {
    let valid = true;
    let firstInvalid = null;

    const markInvalid = (id, message, element) => {
      setFieldError(id, message);
      if (!firstInvalid) firstInvalid = element;
      valid = false;
    };

    if (!hasPhoto()) {
      const photoError = document.getElementById('fotoError');
      if (photoError) {
        photoError.textContent = 'Sube al menos una foto de referencia';
        photoError.hidden = false;
      }
      if (!firstInvalid) firstInvalid = photoTrigger;
      valid = false;
    } else {
      const photoError = document.getElementById('fotoError');
      if (photoError) photoError.hidden = true;
    }

    const nombre = document.getElementById('nombre');
    if (!nombre?.value.trim()) {
      markInvalid('nombre', 'Nombre requerido', nombre?.closest('.mvp-form-field') || nombre);
    } else {
      setFieldError('nombre', '');
    }

    if (!getSelectedChips('tipo').length) {
      markInvalid('tipo', 'Selecciona el tipo', getChoiceGroup('tipo')?.closest('.mvp-form-field'));
    } else {
      setFieldError('tipo', '');
    }

    if (!getSelectedChips('sexo').length) {
      markInvalid('sexo', 'Selecciona el sexo', getChoiceGroup('sexo')?.closest('.mvp-form-field'));
    } else {
      setFieldError('sexo', '');
    }

    if (!isAgeFilled()) {
      markInvalid('edad', 'Indica años o meses', document.getElementById('edadAnios')?.closest('.mvp-form-field'));
    } else {
      const ageMessage = validateAgeValues();
      if (ageMessage) {
        markInvalid('edad', ageMessage, document.getElementById('edadAnios')?.closest('.mvp-form-field'));
      } else {
        setFieldError('edad', '');
      }
    }

    if (firstInvalid) scrollFieldIntoView(firstInvalid);
    return valid;
  }

  ['edadAnios', 'edadMeses'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => setFieldError('edad', ''));
  });

  function setSavingState(isSaving) {
    submitBtn?.classList.toggle('is-loading', isSaving);
    submitBtn?.toggleAttribute('disabled', isSaving);
    submitBtn?.setAttribute('aria-busy', isSaving ? 'true' : 'false');
    form.querySelectorAll('input, textarea, select, button').forEach((el) => {
      if (el === submitBtn) return;
      el.toggleAttribute('disabled', isSaving);
    });
  }

  function transitionPanels(fromPanel, toPanel) {
    return new Promise((resolve) => {
      fromPanel.classList.add('is-leaving');
      fromPanel.classList.remove('is-active');

      window.setTimeout(() => {
        fromPanel.classList.add('is-hidden');
        fromPanel.hidden = true;
        fromPanel.classList.remove('is-leaving');

        toPanel.hidden = false;
        toPanel.classList.remove('is-hidden');
        toPanel.classList.add('is-entering');

        window.requestAnimationFrame(() => {
          toPanel.classList.add('is-active');
          toPanel.classList.remove('is-entering');
          scrollFieldIntoView(toPanel);
          resolve();
        });
      }, 280);
    });
  }

  function simulateUpload() {
    return new Promise((resolve) => {
      let percent = 0;
      progressPanel?.removeAttribute('hidden');
      progressPanel?.setAttribute('aria-hidden', 'false');
      if (progressText) progressText.textContent = 'Subiendo foto…';
      announce('Guardando registro y subiendo foto');

      const timer = window.setInterval(() => {
        percent = Math.min(100, percent + 10 + Math.round(Math.random() * 12));
        if (progressFill) {
          progressFill.style.width = `${percent}%`;
          progressFill.setAttribute('aria-valuenow', String(percent));
        }
        if (progressLabel) progressLabel.textContent = `${percent}%`;

        if (percent >= 100) {
          window.clearInterval(timer);
          if (progressText) progressText.textContent = 'Finalizando…';
          window.setTimeout(resolve, 400);
        }
      }, 130);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      announce('Revisa los campos marcados en rojo');
      return;
    }

    setSavingState(true);
    announce(editPet ? 'Guardando cambios' : 'Guardando animal');

    try {
      await simulateUpload();

      if (editPet) {
        window.location.href = 'panel-albergue.html';
        return;
      }

      const codigo = 'HU-0001';
      const publicPath = `../animal/perfil-animal.html?codigo=${encodeURIComponent(codigo)}&from=panel`;

      if (successCode) successCode.textContent = codigo;
      if (viewPublicBtn) viewPublicBtn.href = publicPath;

      await transitionPanels(formPanel, successPanel);
      announce(`Animal registrado con código ${codigo}`);
    } finally {
      progressPanel?.setAttribute('hidden', '');
      progressPanel?.setAttribute('aria-hidden', 'true');
      if (progressFill) {
        progressFill.style.width = '0%';
        progressFill.setAttribute('aria-valuenow', '0');
      }
      if (progressLabel) progressLabel.textContent = '0%';
      setSavingState(false);
    }
  });

  resetBtn?.addEventListener('click', async () => {
    form.reset();
    resetChoiceChips();
    setFieldError('nombre', '');
    setFieldError('tipo', '');
    setFieldError('sexo', '');
    setFieldError('edad', '');
    const photoError = document.getElementById('fotoError');
    if (photoError) photoError.hidden = true;

    if (pendingSourceUrl) revokeUrl(pendingSourceUrl);
    pendingSourceUrl = '';
    clearConfirmedPreview();

    await transitionPanels(successPanel, formPanel);
    announce('Formulario listo para registrar otro animal');
  });
})();
