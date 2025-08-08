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
  const filtered = colegios.filter(item => item.estado === estado);
  
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
}
// Función para enviar el formulario
async function enviarFormulario(e) {
  e.preventDefault();
  
  // Validaciones (mantén tus validaciones existentes)
  
  // Recoger datos del formulario
  const formData = {
    Fecha: new Date().toISOString(),
    Nombre: document.getElementById('Nombre').value,
    Apellido: document.getElementById('Apellido').value,
    Email: document.getElementById('Email').value,
    Genero: document.getElementById('Género').value,
    Fecha_Nacimiento: document.getElementById('Fecha Nacimiento').value,
    Telefono: document.getElementById('Teléfono').value,
    Documento: document.getElementById('Documento').value,
    Perfil: document.getElementById('Perfil').value,
    Perfil_Otro: document.getElementById('Perfil Otro').value,
    Macro_FE: document.getElementById('Macro_FE').value,
    Macro_AVEC: document.getElementById('Macro_AVEC').value,
    Macro_Unicef: document.getElementById('Macro_Unicef').value,
    Macro_ADIEP: document.getElementById('Macro_ADIEP').value,
    Macro_amblema: document.getElementById('Macro_amblema').value,
    Macro_impromta: document.getElementById('Macro_impromta').value,
    Plan_Profuturo: document.getElementById('Plan Profuturo').value,
    Cursos_Previos: document.getElementById('Cursos Previos').value,
    Medio_Informacion: document.getElementById('Medio Información').value,
    Medio_Otro: document.getElementById('Medio Otro').value,
    Estado: document.getElementById('Estado').value,
    Municipio: document.getElementById('Municipio').value,
    Parroquia: document.getElementById('Parroquia').value,
    Colegio: document.getElementById('Colegio').value,
    Registrado: document.getElementById('El colegio esta registrado').value,
    
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

    // Solo resetear si el cambio viene del estado
  if (source === 'estado') {
    municipioSelect.innerHTML = '<option value="">Todos los municipios</option>';
    parroquiaSelect.innerHTML = '<option value="">Todas las parroquias</option>';
  }
  
  // Si no hay estado seleccionado, limpiar todo
  if (!estado) {
    document.getElementById('colegio').innerHTML = '<option value="">Seleccione un estado primero</option>';
    document.getElementById('colegio').disabled = true;
    return;
  }
