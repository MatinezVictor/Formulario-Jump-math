// Configuración de SheetDB
const SHEETDB_ENDPOINT = 'https://sheetdb.io/api/v1/1fs3hqwxnyq4g'; // Reemplaza con tu ID

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

// Función para cargar filtros (similar a tu versión original pero con datos locales)
function cargarFiltros(source = 'estado') {
  // ... (implementación similar a la que te envié antes)
  // Usa los datos de colegiosData en lugar de google.script.run
}

// Función para enviar el formulario
async function enviarFormulario(e) {
  e.preventDefault();
  
  // Validaciones (mantén tus validaciones existentes)
  
  // Recoger datos del formulario
  const formData = {
    Fecha: new Date().toISOString(),
    Nombre: document.getElementById('nombre').value,
    Apellido: document.getElementById('apellido').value,
    Email: document.getElementById('email').value,
    // ... todos los demás campos
    // IMPORTANTE: Los nombres deben coincidir con los encabezados de tu Sheet
  };
  
  try {
    const button = document.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Enviando...';
    
    // Enviar a SheetDB (hoja de Respuestas)
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

// Mantén tus funciones de UI (togglePerfilOtro, etc.)
