// ============================================
// BASE DE LA ALIANZA REBELDE - Este codigo solo lo entiende yoda y yo y ya creo que ni eso que la fuerza te acompañe
// ============================================

// ---------- DATOS INICIALES ----------
const navesIniciales = [
  { id: 'n1', nombre: 'X-Wing', tipo: 'caza', velocidad: 100, tripulacion: 2, estado: 'operativa', emoji: '🛸' },
  { id: 'n2', nombre: 'Millennium Falcon', tipo: 'transporte', velocidad: 75, tripulacion: 6, estado: 'operativa', emoji: '🛸' },
  { id: 'n3', nombre: 'A-Wing', tipo: 'caza', velocidad: 120, tripulacion: 1, estado: 'operativa', emoji: '🛸' },
  { id: 'n4', nombre: 'Y-Wing', tipo: 'bombardero', velocidad: 80, tripulacion: 2, estado: 'en reparación', emoji: '🛸' },
  { id: 'n5', nombre: 'CR90 Corvette', tipo: 'fragata', velocidad: 60, tripulacion: 30, estado: 'operativa', emoji: '🚀' },
  { id: 'n6', nombre: 'GR-75 Transport', tipo: 'carguero', velocidad: 50, tripulacion: 10, estado: 'operativa', emoji: '🚀' },
  { id: 'n7', nombre: 'B-Wing', tipo: 'bombardero', velocidad: 90, tripulacion: 1, estado: 'destruida', emoji: '💥' },
];

// ---------- STORAGE ----------
const STORAGE_KEYS = {
  NAVES: 'rebelde_naves',
  PILOTOS: 'rebelde_pilotos',
  MISIONES: 'rebelde_misiones'
};

function cargarDatosIniciales() {
  if (!localStorage.getItem(STORAGE_KEYS.NAVES)) {
    localStorage.setItem(STORAGE_KEYS.NAVES, JSON.stringify(navesIniciales));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PILOTOS)) {
    localStorage.setItem(STORAGE_KEYS.PILOTOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MISIONES)) {
    localStorage.setItem(STORAGE_KEYS.MISIONES, JSON.stringify([]));
  }
}

function obtenerNaves() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NAVES)) || [];
}

function obtenerPilotos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PILOTOS)) || [];
}

function obtenerMisiones() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MISIONES)) || [];
}

function guardarNaves(naves) {
  localStorage.setItem(STORAGE_KEYS.NAVES, JSON.stringify(naves));
}

function guardarPilotos(pilotos) {
  localStorage.setItem(STORAGE_KEYS.PILOTOS, JSON.stringify(pilotos));
}

function guardarMisiones(misiones) {
  localStorage.setItem(STORAGE_KEYS.MISIONES, JSON.stringify(misiones));
}

// ---------- UTILIDADES ----------
function generarId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ---------- SECCIÓN HANGAR ----------
let ordenVelocidadAsc = true;

function renderizarHangar() {
  const naves = obtenerNaves();
  const buscador = document.getElementById('buscador-naves');
  const filtroTipo = document.getElementById('filtro-tipo');
  const termino = buscador.value.toLowerCase() || '';
  const tipoSeleccionado = filtroTipo?.value || '';

  let navesFiltradas = naves.filter(nave =>
    nave.nombre.toLowerCase().includes(termino) &&
    (tipoSeleccionado === '' || nave.tipo === tipoSeleccionado)
  );

  navesFiltradas.sort((a, b) => ordenVelocidadAsc ? a.velocidad - b.velocidad : b.velocidad - a.velocidad);

  const grid = document.getElementById('grid-naves');
  const contador = document.getElementById('contador-naves');

  grid.innerHTML = '';
  navesFiltradas.forEach(nave => {
    const card = document.createElement('div');
    card.className = 'nave-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <h3>${nave.emoji} ${nave.nombre}</h3>
      <p>Tipo: ${nave.tipo}</p>
      <p>Velocidad: ${nave.velocidad} </p>
      <p>Tripulación: ${nave.tripulacion}</p>
      <p>Estado: ${nave.estado}</p>
    `;
    card.addEventListener('click', () => mostrarModalNave(nave));
    grid.appendChild(card);
  });

  contador.textContent = `${navesFiltradas.length} nave${navesFiltradas.length !== 1 ? 's' : ''}`;
}

function mostrarModalNave(nave) {
  const modal = document.getElementById('modal-nave');
  const body = document.getElementById('modal-nave-body');
  body.innerHTML = `
    <h2>${nave.emoji} ${nave.nombre}</h2>
    <p><strong>Tipo:</strong> ${nave.tipo}</p>
    <p><strong>Velocidad:</strong> ${nave.velocidad} MGLT</p>
    <p><strong>Tripulación máxima:</strong> ${nave.tripulacion}</p>
    <p><strong>Estado:</strong> ${nave.estado}</p>
    <p><strong>ID:</strong> ${nave.id}</p>
  `;
  modal.hidden = false;
}

function setupHangarEventos() {
  document.getElementById('buscador-naves').addEventListener('input', renderizarHangar);
  document.getElementById('filtro-tipo').addEventListener('change', renderizarHangar);
  document.getElementById('btn-ordenar').addEventListener('click', () => {
    ordenVelocidadAsc = !ordenVelocidadAsc;
    renderizarHangar();
  });
  document.getElementById('modal-close-btn').addEventListener('click', () => {
    document.getElementById('modal-nave').hidden = true;
  });
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal-nave');
    if (e.target === modal) modal.hidden = true;
  });
}

// ---------- SECCIÓN PILOTOS ----------
let pilotoEditandoId = null;

function renderizarListaPilotos() {
  const pilotos = obtenerPilotos();
  const naves = obtenerNaves();
  const container = document.getElementById('lista-pilotos');
  container.innerHTML = '';

  if (pilotos.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:1rem;">No hay pilotos registrados. ¡Añade uno!</p>';
    return;
  }

  pilotos.forEach(piloto => {
    const nave = naves.find(n => n.id === piloto.naveId);
    const nombreNave = nave ? nave.nombre : 'Sin nave';
    const item = document.createElement('div');
    item.className = 'piloto-item';
    item.innerHTML = `
      <span><strong>${piloto.nombre}</strong> (${piloto.rango})</span>
      <span>${nombreNave}</span>
      <span>Victorias: ${piloto.victorias}</span>
      <span>${piloto.estado}</span>
      <div class="acciones">
        <button class="btn-editar" data-id="${piloto.id}" aria-label="Editar piloto">✏️</button>
        <button class="btn-eliminar" data-id="${piloto.id}" aria-label="Eliminar piloto">🗑️</button>
      </div>
    `;
    container.appendChild(item);
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => cargarPilotoParaEditar(btn.dataset.id));
  });
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => eliminarPiloto(btn.dataset.id));
  });
}

function cargarSelectNaves() {
  const select = document.getElementById('piloto-nave');
  const naves = obtenerNaves().filter(n => n.estado === 'operativa');
  select.innerHTML = '<option value="">Selecciona nave</option>';
  naves.forEach(nave => {
    const option = document.createElement('option');
    option.value = nave.id;
    option.textContent = `${nave.nombre} (${nave.tipo})`;
    select.appendChild(option);
  });
}

function validarFormularioPiloto() {
  const nombre = document.getElementById('piloto-nombre').value.trim();
  const rango = document.getElementById('piloto-rango').value;
  const naveId = document.getElementById('piloto-nave').value;
  const victorias = document.getElementById('piloto-victorias').value;
  const estado = document.getElementById('piloto-estado').value;

  if (!nombre || !rango || !naveId || victorias === '' || !estado) {
    return 'Todos los campos son obligatorios.';
  }
  if (isNaN(victorias) || Number(victorias) < 0) {
    return 'Las victorias deben ser un número positivo.';
  }
  return null;
}

function guardarPiloto() {
  const errorDiv = document.getElementById('form-error');
  const error = validarFormularioPiloto();
  if (error) {
    errorDiv.textContent = error;
    errorDiv.hidden = false;
    return;
  }
  errorDiv.hidden = true;

  const pilotos = obtenerPilotos();
  const pilotoData = {
    id: pilotoEditandoId || generarId(),
    nombre: document.getElementById('piloto-nombre').value.trim(),
    rango: document.getElementById('piloto-rango').value,
    naveId: document.getElementById('piloto-nave').value,
    victorias: Number(document.getElementById('piloto-victorias').value),
    estado: document.getElementById('piloto-estado').value
  };

  if (pilotoEditandoId) {
    const index = pilotos.findIndex(p => p.id === pilotoEditandoId);
    if (index !== -1) pilotos[index] = pilotoData;
  } else {
    pilotos.push(pilotoData);
  }

  guardarPilotos(pilotos);
  limpiarFormularioPiloto();
  renderizarListaPilotos();
  actualizarSelectPilotosMisiones();
}

function cargarPilotoParaEditar(id) {
  const piloto = obtenerPilotos().find(p => p.id === id);
  if (!piloto) return;

  document.getElementById('piloto-nombre').value = piloto.nombre;
  document.getElementById('piloto-rango').value = piloto.rango;
  document.getElementById('piloto-nave').value = piloto.naveId;
  document.getElementById('piloto-victorias').value = piloto.victorias;
  document.getElementById('piloto-estado').value = piloto.estado;
  document.getElementById('piloto-id').value = piloto.id;
  pilotoEditandoId = piloto.id;

  document.getElementById('btn-cancelar-piloto').hidden = false;
}

function eliminarPiloto(id) {
  if (!confirm('¿Estás seguro de eliminar a este piloto?')) return;
  const pilotos = obtenerPilotos().filter(p => p.id !== id);
  guardarPilotos(pilotos);
  if (pilotoEditandoId === id) limpiarFormularioPiloto();
  renderizarListaPilotos();
  actualizarSelectPilotosMisiones();
}

function limpiarFormularioPiloto() {
  document.getElementById('piloto-nombre').value = '';
  document.getElementById('piloto-rango').value = '';
  document.getElementById('piloto-nave').value = '';
  document.getElementById('piloto-victorias').value = '';
  document.getElementById('piloto-estado').value = '';
  document.getElementById('piloto-id').value = '';
  pilotoEditandoId = null;
  document.getElementById('form-error').hidden = true;
  document.getElementById('btn-cancelar-piloto').hidden = true;
}

function setupPilotosEventos() {
  document.getElementById('btn-guardar-piloto').addEventListener('click', guardarPiloto);
  document.getElementById('btn-cancelar-piloto').addEventListener('click', limpiarFormularioPiloto);
  cargarSelectNaves();
  renderizarListaPilotos();
}

// ---------- SECCIÓN MISIONES ----------
function renderizarKanban() {
  const misiones = obtenerMisiones();
  const filtroDificultad = document.getElementById('filtro-dificultad').value;
  const pilotos = obtenerPilotos();

  const columnas = {
    'pendiente': [],
    'en-curso': [],
    'completada': []
  };

  misiones.forEach(m => {
    if (columnas[m.estado]) {
      if (filtroDificultad === '' || m.dificultad === filtroDificultad) {
        columnas[m.estado].push(m);
      }
    }
  });

  for (const estado in columnas) {
    const container = document.getElementById(`cards-${estado}`);
    const contador = document.getElementById(`count-${estado}`);
    container.innerHTML = '';
    columnas[estado].forEach(mision => {
      const piloto = pilotos.find(p => p.id === mision.pilotoId);
      const nombrePiloto = piloto ? piloto.nombre : 'Sin asignar';
      const card = document.createElement('div');
      card.className = 'mision-card';
      card.draggable = true;
      card.dataset.id = mision.id;
      card.innerHTML = `
        <h3>${mision.nombre}</h3>
        <p>${mision.descripcion}</p>
        <p><strong>Piloto:</strong> ${nombrePiloto}</p>
        <span class="dificultad ${mision.dificultad}">${mision.dificultad}</span>
        <p>📅 ${mision.fecha}</p>
        <div class="mision-actions">
          ${mision.estado !== 'completada' ? `<button class="btn-avanzar">➡️ Avanzar</button>` : ''}
          <button class="btn-eliminar-mision">🗑️</button>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', mision.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));

      const btnAvanzar = card.querySelector('.btn-avanzar');
      if (btnAvanzar) {
        btnAvanzar.addEventListener('click', () => avanzarMision(mision.id));
      }
      card.querySelector('.btn-eliminar-mision').addEventListener('click', () => eliminarMision(mision.id));

      container.appendChild(card);
    });
    contador.textContent = columnas[estado].length;
  }
}

function avanzarMision(id) {
  const misiones = obtenerMisiones();
  const mision = misiones.find(m => m.id === id);
  if (!mision) return;
  if (mision.estado === 'pendiente') mision.estado = 'en-curso';
  else if (mision.estado === 'en-curso') mision.estado = 'completada';
  guardarMisiones(misiones);
  renderizarKanban();
}

function eliminarMision(id) {
  if (!confirm('¿Eliminar esta misión?')) return;
  const misiones = obtenerMisiones().filter(m => m.id !== id);
  guardarMisiones(misiones);
  renderizarKanban();
}

function handleDrop(event, nuevoEstado) {
  event.preventDefault();
  const id = event.dataTransfer.getData('text/plain');
  const misiones = obtenerMisiones();
  const mision = misiones.find(m => m.id === id);
  if (mision) {
    mision.estado = nuevoEstado;
    guardarMisiones(misiones);
    renderizarKanban();
  }
}

function actualizarSelectPilotosMisiones() {
  const select = document.getElementById('mision-piloto');
  const pilotosActivos = obtenerPilotos().filter(p => p.estado === 'activo');
  select.innerHTML = '<option value="">Sin piloto</option>';
  pilotosActivos.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.nombre;
    select.appendChild(option);
  });
}

function guardarMision() {
  const nombre = document.getElementById('mision-nombre').value.trim();
  const descripcion = document.getElementById('mision-descripcion').value.trim();
  const pilotoId = document.getElementById('mision-piloto').value;
  const dificultad = document.getElementById('mision-dificultad').value;
  const fecha = document.getElementById('mision-fecha').value;

  if (!nombre || !descripcion || !dificultad || !fecha) {
    document.getElementById('form-mision-error').textContent = 'Todos los campos son obligatorios.';
    document.getElementById('form-mision-error').hidden = false;
    return;
  }

  const nuevaMision = {
    id: generarId(),
    nombre,
    descripcion,
    pilotoId: pilotoId || null,
    dificultad,
    fecha,
    estado: 'pendiente'
  };

  const misiones = obtenerMisiones();
  misiones.push(nuevaMision);
  guardarMisiones(misiones);
  renderizarKanban();

  document.getElementById('mision-nombre').value = '';
  document.getElementById('mision-descripcion').value = '';
  document.getElementById('mision-piloto').value = '';
  document.getElementById('mision-dificultad').value = '';
  document.getElementById('mision-fecha').value = '';
  document.getElementById('form-mision-error').hidden = true;
}

function setupMisionesEventos() {
  document.getElementById('btn-guardar-mision').addEventListener('click', guardarMision);
  document.getElementById('filtro-dificultad').addEventListener('change', renderizarKanban);
  actualizarSelectPilotosMisiones();
  renderizarKanban();

  window.handleDrop = handleDrop;
}

function renderizarDashboard() {
  const naves = obtenerNaves();
  const pilotos = obtenerPilotos();
  const misiones = obtenerMisiones();

  const totalNaves = naves.length;
  const operativas = naves.filter(n => n.estado === 'operativa').length;
  const enReparacion = naves.filter(n => n.estado === 'en reparación').length;
  const destruidas = naves.filter(n => n.estado === 'destruida').length;

  const totalPilotos = pilotos.length;
  const activos = pilotos.filter(p => p.estado === 'activo').length;
  const heridos = pilotos.filter(p => p.estado === 'herido').length;
  const kia = pilotos.filter(p => p.estado === 'KIA').length;

  const pendientes = misiones.filter(m => m.estado === 'pendiente').length;
  const enCurso = misiones.filter(m => m.estado === 'en-curso').length;
  const completadas = misiones.filter(m => m.estado === 'completada').length;
  const totalMisiones = misiones.length;
  const porcentajeCompletadas = totalMisiones ? (completadas / totalMisiones) * 100 : 0;

  const pilotoTop = pilotos.reduce((max, p) => p.victorias > (max?.victorias || 0) ? p : max, null);
  const naveMasRapida = naves.reduce((max, n) => n.velocidad > (max?.velocidad || 0) ? n : max, null);

  const container = document.getElementById('dashboard-content');
  container.innerHTML = `
    <div class="stat-card">
      <h3> Flota</h3>
      <div class="stat-number">${totalNaves}</div>
      <div class="stat-detail">Operativas: ${operativas} | Reparación: ${enReparacion} | Destruidas: ${destruidas}</div>
    </div>
    <div class="stat-card">
      <h3> Pilotos</h3>
      <div class="stat-number">${totalPilotos}</div>
      <div class="stat-detail">Activos: ${activos} | Heridos: ${heridos} | KIA: ${kia}</div>
    </div>
    <div class="stat-card">
      <h3> Misiones</h3>
      <div class="stat-number">${totalMisiones}</div>
      <div class="stat-detail">Pendientes: ${pendientes} | En curso: ${enCurso} | Completadas: ${completadas}</div>
    </div>
    <div class="stat-card">
      <h3> Top Piloto</h3>
      <div class="stat-number">${pilotoTop ? pilotoTop.nombre : '—'}</div>
      <div class="stat-detail">Victorias: ${pilotoTop ? pilotoTop.victorias : 0}</div>
    </div>
    <div class="stat-card">
      <h3> Nave más rápida</h3>
      <div class="stat-number">${naveMasRapida ? naveMasRapida.nombre : '—'}</div>
      <div class="stat-detail">Velocidad: ${naveMasRapida ? naveMasRapida.velocidad : 0} MGLT</div>
    </div>
    <div class="stat-card">
      <h3> Progreso de misiones</h3>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width:${porcentajeCompletadas}%">${porcentajeCompletadas.toFixed(1)}%</div>
      </div>
    </div>
  `;
}

function cambiarSeccion(seccionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(seccionId).classList.add('active');
  document.querySelector(`[data-section="${seccionId}"]`).classList.add('active');

  if (seccionId === 'hangar') {
    renderizarHangar();
  } else if (seccionId === 'pilotos') {
    cargarSelectNaves();
    renderizarListaPilotos();
  } else if (seccionId === 'misiones') {
    actualizarSelectPilotosMisiones();
    renderizarKanban();
  } else if (seccionId === 'dashboard') {
    renderizarDashboard();
  }
}

function setupNavegacion() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const seccion = btn.dataset.section;
      cambiarSeccion(seccion);
    });
  });
}
function inicializarApp() {
  cargarDatosIniciales();
  setupNavegacion();
  setupHangarEventos();
  setupPilotosEventos();
  setupMisionesEventos();
  inicializarTema();
  setupExportacion();

  cambiarSeccion('hangar');
}

document.addEventListener('DOMContentLoaded', inicializarApp);


// ---------- MODO CLARO/OSCURO ----------
const THEME_KEY = 'rebelde_theme';

function aplicarTema(tema) {
  if (tema === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('theme-toggle').textContent = '🌙';
    document.getElementById('theme-toggle').setAttribute('aria-label', 'Cambiar a modo oscuro');
  } else {
    document.body.classList.remove('light-mode');
    document.getElementById('theme-toggle').textContent = '☀️';
    document.getElementById('theme-toggle').setAttribute('aria-label', 'Cambiar a modo claro');
  }
  localStorage.setItem(THEME_KEY, tema);
}

function toggleTema() {
  const temaActual = localStorage.getItem(THEME_KEY) || 'dark';
  const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
  aplicarTema(nuevoTema);
}

function inicializarTema() {
  const temaGuardado = localStorage.getItem(THEME_KEY) || 'dark';
  aplicarTema(temaGuardado);
  document.getElementById('theme-toggle').addEventListener('click', toggleTema);
}

// ---------- EXPORTAR A JSON ----------
function exportarDatosJSON() {
  const pilotos = obtenerPilotos();
  const misiones = obtenerMisiones();

  const datos = {
    exportado: new Date().toISOString(),
    pilotos: pilotos,
    misiones: misiones
  };

  const jsonStr = JSON.stringify(datos, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `rebelde_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function setupExportacion() {
  const btnExportar = document.getElementById('btn-exportar-json');
  if (btnExportar) {
    btnExportar.addEventListener('click', exportarDatosJSON);
  }
}