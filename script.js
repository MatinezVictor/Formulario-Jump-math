// Agrega al inicio del script
const CACHE_KEY = 'formulario_pendiente';

// Configuración de SheetDB
const SHEETDB_ENDPOINT = 'https://sheetdb.io/api/v1/1fs3hqwxnyq4g';

// Variables globales
let estadosData = [];
let colegiosData = [];

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
  await cargarDatosIniciales();
  inicializarEventos();
});

// Función para cargar datos iniciales
async function cargarDatosIniciales() {
  try {
    // Cargar estados
    const estadosResponse = await fetch(`${SHEETDB_ENDPOINT}?sheet=Colegios&distinct=0`);
    const estados = await estadosResponse.json();
    estadosData = estados.map(item => item['0']).filter(Boolean);
    
    // Llenar estados en el select
    const estadoSelect = document.getElementById('estado');
    estadoSelect.innerHTML = '<option value="">Seleccione un estado...</option>';
    estadosData.forEach(estado => {
      const option = document.createElement('option');
      option.value = estado;
      option.textContent = estado;
      estadoSelect.appendChild(option);
    });
    
    // Cargar todos los colegios
    const colegiosResponse = await fetch(`${SHEETDB_ENDPOINT}?sheet=Colegios`);
    const colegios = await colegiosResponse.json();
    colegiosData = colegios.map(item => ({
      estado: item['0'],
      municipio: item['1'],
      parroquia: item['2'],
      colegio: item['4']
    })).filter(item => item.estado && item.colegio);
    
  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('Error al cargar datos iniciales. Por favor recargue la página.');
  }
}

// Función para inicializar eventos
function inicializarEventos() {
  // Eventos para campos que muestran/ocultan otros campos
  document.getElementById('perfil').addEventListener('change', togglePerfilOtro);
  document.getElementById('medioInfo').addEventListener('change', toggleMedioOtro);
  
  // Eventos para los selects de ubicación
  document.getElementById('estado').addEventListener('change', () => cargarFiltros('estado'));
  document.getElementById('municipio').addEventListener('change', () => cargarFiltros('municipio'));
  document.getElementById('parroquia').addEventListener('change', () => cargarFiltros('parroquia'));
  
  // Evento para mostrar campo manual de colegio
  document.querySelector('.manual-input-link').addEventListener('click', mostrarCampoManual);
  
  // Evento de envío del formulario
  document.getElementById('mainForm').addEventListener('submit', enviarFormulario);
}

// Función completa para cargar filtros
function cargarFiltros(source = 'estado') {
  const estado = document.getElementById('estado').value;
  const municipioSelect = document.getElementById('municipio');
  const parroquiaSelect = document.getElementById('parroquia');
  
  if (source === 'estado') {
    municipioSelect.innerHTML = '<option value="">Todos los municipios</option>';
    parroquiaSelect.innerHTML = '<option value="">Todas las parroquias</option>';
  }
  
  if (!estado) {
    document.getElementById('colegio').innerHTML = '<option value="">Seleccione un estado primero</option>';
    document.getElementById('colegio').disabled = true;
    return;
  }
  
  // Filtramos los datos del cache
  const filtered = colegiosData.filter(item => item.estado === estado);
  
  // Actualizar municipios
  if (source === 'estado') {
    const municipios = [...new Set(filtered.map(item => item.municipio))].filter(Boolean);
    municipios.forEach(municipio => {
      const option = document.createElement('option');
      option.value = municipio;
      option.textContent = municipio;
      municipioSelect.appendChild(option);
    });
  }
  
  // Actualizar parroquias
  const municipio = municipioSelect.value;
  const parroquias = [...new Set(
    filtered
      .filter(item => !municipio || item.municipio === municipio)
      .map(item => item.parroquia)
  )].filter(Boolean);
  
  parroquiaSelect.innerHTML = '<option value="">Todas las parroquias</option>';
  parroquias.forEach(parroquia => {
    const option = document.createElement('option');
    option.value = parroquia;
    option.textContent = parroquia;
    parroquiaSelect.appendChild(option);
  });
  
  cargarColegios();
}

// Función para cargar colegios
function cargarColegios() {
  const estado = document.getElementById('estado').value;
  const municipio = document.getElementById('municipio').value;
  const parroquia = document.getElementById('parroquia').value;
  const colegioSelect = document.getElementById('colegio');
  
  if (!estado) {
    colegioSelect.innerHTML = '<option value="">Seleccione un estado primero</option>';
    colegioSelect.disabled = true;
    return;
  }
  
  const filtered = colegiosData.filter(item => 
    item.estado === estado &&
    (!municipio || item.municipio === municipio) &&
    (!parroquia || item.parroquia === parroquia)
  );
  
  const colegios = [...new Set(filtered.map(item => item.colegio))].filter(Boolean);
  
  colegioSelect.innerHTML = '<option value="">Seleccione un colegio</option>';
  colegios.forEach(colegio => {
    const option = document.createElement('option');
    option.value = colegio;
    option.textContent = colegio;
    colegioSelect.appendChild(option);
  });
  
  colegioSelect.disabled = false;
}

// Función para enviar el formulario (corregida)
async function enviarFormulario(e) {
  e.preventDefault();
  
  // Validar campos requeridos
  const requiredFields = ['nombre', 'apellido', 'email', 'genero', 'fechaNacimiento', 'telefono', 'documento', 'perfil', 'estado'];
  let isValid = true;
  
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value) {
      field.style.borderColor = '#e74c3c';
      isValid = false;
    } else {
      field.style.borderColor = '#ddd';
    }
  });
  
  // Validar colegio (select o manual)
  const colegioSelect = document.getElementById('colegio');
  const colegioManual = document.getElementById('colegioManual')?.value;
  
  if (!colegioSelect.value && !colegioManual) {
    alert('Por favor seleccione o escriba el nombre de su colegio');
    return;
  }
  
  if (!isValid) {
    alert('Por favor complete todos los campos requeridos');
    return;
  }
  
  // Recoger datos del formulario (ajustado a tus IDs reales)
  const formData = {
    Fecha: new Date().toISOString(),
    Nombre: document.getElementById('nombre').value,
    Apellido: document.getElementById('apellido').value,
    Email: document.getElementById('email').value,
    Género: document.getElementById('genero').value,
    "Fecha Nacimiento": document.getElementById('fechaNacimiento').value,
    Teléfono: document.getElementById('telefono').value,
    Documento: document.getElementById('documento').value,
    Perfil: document.getElementById('perfil').value,
    "Perfil Otro": document.getElementById('perfilOtro')?.value || '',
    "Macro_FE": document.querySelector('input[name="macro"][value="FE y Alegria"]').checked ? 'Sí' : 'No',
    "Macro_AVEC": document.querySelector('input[name="macro"][value="AVEC"]').checked ? 'Sí' : 'No',
    "Macro_Unicef": document.querySelector('input[name="macro"][value="Unicef"]').checked ? 'Sí' : 'No',
    "Macro_ADIEP": document.querySelector('input[name="macro"][value="ADIEP"]').checked ? 'Sí' : 'No',
    "Macro_amblema": document.querySelector('input[name="macro"][value="amblema"]').checked ? 'Sí' : 'No',
    "Macro_impromta": document.querySelector('input[name="macro"][value="impromta"]').checked ? 'Sí' : 'No',
    "Plan Profuturo": document.getElementById('planProfuturo').value,
    "Cursos Previos": document.getElementById('cursosPrevios').value,
    "Medio Información": document.getElementById('medioInfo').value,
    "Medio Otro": document.getElementById('medioOtro')?.value || '',
    Estado: document.getElementById('estado').value,
    Municipio: document.getElementById('municipio').value || '',
    Parroquia: document.getElementById('parroquia').value || '',
    Colegio: colegioSelect.value || colegioManual,
    "Es Colegio Manual": !colegioSelect.value ? 'Sí' : 'No'
  };
  
  try {
    const button = document.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Enviando...';
    
    // Enviar a SheetDB
    const response = await fetch(SHEETDB_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: formData })
    });
    
    if (response.ok) {
      alert('¡Registro completado con éxito!');
      document.getElementById('mainForm').reset();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el servidor');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al enviar el formulario: ' + error.message);
  } finally {
    const button = document.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = false;
      button.textContent = 'Enviar Registro';
    }
  }
}

// Guardar datos si falla el envío
localStorage.setItem(CACHE_KEY, JSON.stringify(formData));

// Funciones de UI (mantenidas igual)
function togglePerfilOtro() {
  const perfil = document.getElementById('perfil').value;
  document.getElementById('perfilOtroGroup').style.display = 
    (perfil === 'Otro') ? 'block' : 'none';
}

function toggleMedioOtro() {
  const medio = document.getElementById('medioInfo').value;
  document.getElementById('medioOtroGroup').style.display = 
    (medio === 'Otro') ? 'block' : 'none';
}

function toggleColegioManual() {
  const colegioSelect = document.getElementById('colegio');
  const manualGroup = document.getElementById('colegioManualGroup');
  if(colegioSelect.value) {
    manualGroup.style.display = 'none';
    document.getElementById('colegioManual').value = '';
  }
}

function mostrarCampoManual() {
  const manualGroup = document.getElementById('colegioManualGroup');
  const colegioSelect = document.getElementById('colegio');
  
  manualGroup.style.display = 'block';
  colegioSelect.value = '';
}

.catch(error => {
  console.error('Detalles del error:', {
    error: error.message,
    stack: error.stack,
    response: error.response?.text()
  });
});
