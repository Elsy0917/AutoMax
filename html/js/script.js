// Referencias a elementos del DOM
const form = document.getElementById('vehiculo-form');
const codigoInput = document.getElementById('codigo');
const marcaInput = document.getElementById('marca');
const modeloInput = document.getElementById('modelo');
const anioInput = document.getElementById('anio');
const colorInput = document.getElementById('color');
const combustibleInput = document.getElementById('combustible');
const precioInput = document.getElementById('precio');
const cantidadInput = document.getElementById('cantidad');
const descripcionInput = document.getElementById('descripcion');
const modoEdicionInput = document.getElementById('modo-edicion');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const tbody = document.getElementById('vehiculos-tbody');
const formTitulo = document.getElementById('form-titulo');

// Llave para localStorage
const STORAGE_KEY = 'automax_vehiculos';

// Inicializar la aplicación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarVehiculos();
});

// Manejador del envío del formulario (Guardar o Actualizar)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const codigo = codigoInput.value.trim();
    const marca = marcaInput.value.trim();
    const modelo = modeloInput.value.trim();
    const anio = parseInt(anioInput.value);
    const color = colorInput.value.trim();
    const combustible = combustibleInput.value;
    const precio = parseFloat(precioInput.value);
    const cantidad = parseInt(cantidadInput.value);
    const descripcion = descripcionInput.value.trim();
    const modoEdicion = modoEdicionInput.value === 'true';

    // 1. Validaciones requeridas
    if (!codigo || !marca || !modelo || !anio || !color || !combustible || isNaN(precio) || isNaN(cantidad) || !descripcion) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    if (precio <= 0) {
        alert('El precio debe ser mayor que cero.');
        precioInput.focus();
        return;
    }

    const anioActual = new Date().getFullYear() + 1; // Permite vehículos del año próximo
    if (isNaN(anio) || anio < 1900 || anio > anioActual) {
        alert(`Ingrese un año válido entre 1900 y ${anioActual}.`);
        anioInput.focus();
        return;
    }

    if (isNaN(cantidad) || cantidad < 0) {
        alert('La cantidad disponible debe ser un número válido.');
        cantidadInput.focus();
        return;
    }

    let vehiculos = obtenerVehiculos();

    // 2. Validación de código único
    if (!modoEdicion) {
        // Si es nuevo registro, verificar que el código no exista
        const existe = vehiculos.some(v => v.codigo.toLowerCase() === codigo.toLowerCase());
        if (existe) {
            alert('Ya existe un vehículo registrado con este código.');
            codigoInput.focus();
            return;
        }
    }

    if (modoEdicion) {
        // Actualizar registro existente
        vehiculos = vehiculos.map(v => {
            if (v.codigo.toLowerCase() === codigo.toLowerCase()) {
                return { codigo, marca, modelo, anio, color, combustible, precio, cantidad, descripcion };
            }
            return v;
        });
        alert('Vehículo actualizado exitosamente.');
    } else {
        // Crear nuevo registro
        const nuevoVehiculo = { codigo, marca, modelo, anio, color, combustible, precio, cantidad, descripcion };
        vehiculos.push(nuevoVehiculo);
        alert('Vehículo registrado exitosamente.');
    }

    // Guardar en localStorage y refrescar vista
    guardarEnStorage(vehiculos);
    resetearFormulario();
    cargarVehiculos();
});

// Obtener vehículos de localStorage
function obtenerVehiculos() {
    const datos = localStorage.getItem(STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
}

// Guardar array en localStorage
function guardarEnStorage(vehiculos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehiculos));
}

// Renderizar vehículos en la tabla (8 columnas requeridas + acciones)
function cargarVehiculos() {
    const vehiculos = obtenerVehiculos();
    tbody.innerHTML = '';

    if (vehiculos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b;">No hay vehículos registrados.</td></tr>`;
        return;
    }

    vehiculos.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${v.codigo}</strong></td>
            <td>${v.marca}</td>
            <td>${v.modelo}</td>
            <td>${v.anio}</td>
            <td>${v.color}</td>
            <td>${v.combustible}</td>
            <td>$${v.precio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${v.cantidad}</td>
            <td>
                <button class="btn-editar" onclick="prepararEdicion('${v.codigo}')">Editar</button>
                <button class="btn-eliminar" onclick="eliminarVehiculo('${v.codigo}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Eliminar un registro concreto
window.eliminarVehiculo = function(codigo) {
    if (confirm(`¿Está seguro de eliminar el vehículo con código ${codigo}?`)) {
        let vehiculos = obtenerVehiculos();
        vehiculos = vehiculos.filter(v => v.codigo.toLowerCase() !== codigo.toLowerCase());
        guardarEnStorage(vehiculos);
        cargarVehiculos();
        
        // Si estábamos editando justo este vehículo, cancelar modo edición
        if (codigoInput.value.toLowerCase() === codigo.toLowerCase() && modoEdicionInput.value === 'true') {
            resetearFormulario();
        }
    }
}

// Preparar formulario para actualizar un registro
window.prepararEdicion = function(codigo) {
    const vehiculos = obtenerVehiculos();
    const vehiculo = vehiculos.find(v => v.codigo.toLowerCase() === codigo.toLowerCase());

    if (!vehiculo) return;

    codigoInput.value = vehiculo.codigo;
    codigoInput.disabled = true; // El código no debe cambiar para mantener la referencia única
    marcaInput.value = vehiculo.marca;
    modeloInput.value = vehiculo.modelo;
    anioInput.value = vehiculo.anio;
    colorInput.value = vehiculo.color;
    combustibleInput.value = vehiculo.combustible;
    precioInput.value = vehiculo.precio;
    cantidadInput.value = vehiculo.cantidad;
    descripcionInput.value = vehiculo.descripcion;

    modoEdicionInput.value = 'true';
    formTitulo.textContent = 'Actualizar Información de Vehículo';
    btnGuardar.textContent = 'Actualizar Vehículo';
    btnCancelar.style.display = 'inline-block';

    // Desplazarse suavemente hacia el formulario
    form.scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edición
btnCancelar.addEventListener('click', () => {
    resetearFormulario();
});

// Resetear formulario a estado inicial
function resetearFormulario() {
    form.reset();
    codigoInput.disabled = false;
    modoEdicionInput.value = 'false';
    formTitulo.textContent = 'Registro de Vehículo Nuevo';
    btnGuardar.textContent = 'Guardar Vehículo';
    btnCancelar.style.display = 'none';
}