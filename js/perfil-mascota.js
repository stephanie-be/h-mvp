(() => {
  const CATALOG = {
    'HU-0001': {
      codigo: 'HU-0001',
      nombre: 'Luna',
      tipo: 'Gato',
      edad: '8 meses',
      raza: 'Mestiza',
      sexo: 'Hembra',
      caracter: ['Tranquilo', 'Sociable'],
      cuentaCon: ['Desparasitación', 'Cartilla de vacunas'],
      albergue: 'Albergue ABC',
      foto: '../../assets/mascotas/luna.jpg',
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
      foto: '../../assets/mascotas/coco.jpg',
      estado: 'adoptado',
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
      foto: '../../assets/mascotas/abeja.jpg',
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
      foto: '../../assets/mascotas/tony.jpg',
      estado: 'en_albergue',
      notas: 'Energía alta; necesita paseos diarios.',
    },
  };

  function getPet(codigo) {
    return CATALOG[codigo] || null;
  }

  const params = new URLSearchParams(window.location.search);
  const codigo = (params.get('codigo') || 'HU-0001').toUpperCase();
  const fromPanel = params.get('from') === 'panel';
  const pet = getPet(codigo) || getPet('HU-0001');
  if (!pet) return;

  const photo = document.getElementById('petPhoto');
  const codeEl = document.getElementById('petCode');
  const nameEl = document.getElementById('petName');
  const sexIconEl = document.getElementById('petSexIcon');
  const badge = document.getElementById('petBadge');
  const ageEl = document.getElementById('petEdad');
  const breedEl = document.getElementById('petRaza');
  const caracterEl = document.getElementById('petCaracter');
  const shelterEl = document.getElementById('petAlbergue');
  const tutorRow = document.getElementById('petTutorRow');
  const tutorEl = document.getElementById('petTutor');
  const cuentaConBlock = document.getElementById('petCuentaConBlock');
  const cuentaConEl = document.getElementById('petCuentaCon');
  const notesBlock = document.getElementById('petNotasBlock');
  const notesEl = document.getElementById('petNotas');
  const back = document.getElementById('fichaBack');

  function joinList(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    return value || '';
  }

  function renderTags(container, items) {
    if (!container) return;
    container.replaceChildren();
    (items || []).forEach((label) => {
      const li = document.createElement('li');
      li.textContent = label;
      container.appendChild(li);
    });
  }

  if (photo) {
    photo.src = pet.foto;
    photo.alt = pet.nombre;
  }
  if (codeEl) codeEl.textContent = pet.codigo;
  if (nameEl) nameEl.textContent = pet.nombre;
  if (sexIconEl) {
    const sexo = (pet.sexo || '').toLowerCase();
    const femaleIcon = sexIconEl.querySelector('.mvp-sex-icon-female');
    const maleIcon = sexIconEl.querySelector('.mvp-sex-icon-male');
    const isFemale = sexo.includes('hembra') || sexo === 'f' || sexo === 'female';
    const isMale = sexo.includes('macho') || sexo === 'm' || sexo === 'male';
    if (femaleIcon) femaleIcon.hidden = !isFemale;
    if (maleIcon) maleIcon.hidden = !isMale;
    sexIconEl.hidden = !(isFemale || isMale);
  }
  if (ageEl) ageEl.textContent = pet.edad || '—';
  if (breedEl) breedEl.textContent = pet.raza || '—';
  if (caracterEl) caracterEl.textContent = joinList(pet.caracter) || '—';
  if (shelterEl) shelterEl.textContent = pet.albergue || '—';

  const adopted = pet.estado === 'adoptado';
  const tutorName = window.HuelliMvp?.getTutor(pet.codigo)?.nombre || pet.tutor || '';
  if (tutorRow && tutorEl) {
    if (tutorName) {
      tutorEl.textContent = tutorName;
      tutorRow.hidden = false;
    } else {
      tutorEl.textContent = '—';
      tutorRow.hidden = true;
    }
  }

  const cuentaCon = Array.isArray(pet.cuentaCon) ? pet.cuentaCon.filter(Boolean) : [];
  if (cuentaConBlock && cuentaConEl) {
    if (cuentaCon.length) {
      renderTags(cuentaConEl, cuentaCon);
      cuentaConBlock.hidden = false;
    } else {
      cuentaConEl.replaceChildren();
      cuentaConBlock.hidden = true;
    }
  }

  const notas = (pet.notas || '').trim();
  if (notesBlock && notesEl) {
    if (notas) {
      notesEl.textContent = notas;
      notesBlock.hidden = false;
    } else {
      notesEl.textContent = '';
      notesBlock.hidden = true;
    }
  }

  if (badge) {
    badge.classList.toggle('is-adopted', adopted);
    badge.classList.toggle('is-shelter', !adopted);
    badge.textContent = adopted ? 'Adoptado' : 'En albergue';
  }

  document.title = `${pet.nombre} · ${pet.codigo} · Huelli`;

  if (fromPanel && back) {
    back.href = '../albergue/panel-albergue.html';
    back.setAttribute('aria-label', 'Volver al panel del albergue');
  }
})();
