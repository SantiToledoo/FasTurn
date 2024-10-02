// Simulación de usuarios
let usuarios = [
    { id: 1, email: 'paciente1@ejemplo.com', password: '123456', rol: 'paciente', nombre: 'Juan Pérez', dni: '12345678', telefono: '1234567890' },
    { id: 2, email: 'paciente2@ejemplo.com', password: '123456', rol: 'paciente', nombre: 'María García', dni: '87654321', telefono: '0987654321' },
    { id: 3, email: 'medico1@ejemplo.com', password: '123456', rol: 'medico', especialidad: 'Medicina General', nombre: 'Dr. García' },
    { id: 4, email: 'medico2@ejemplo.com', password: '123456', rol: 'medico', especialidad: 'Cardiología', nombre: 'Dra. Rodríguez' },
    { id: 5, email: 'medico3@ejemplo.com', password: '123456', rol: 'medico', especialidad: 'Neurología', nombre: 'Dr. Martínez' },
    { id: 6, email: 'secretaria@ejemplo.com', password: '123456', rol: 'secretaria' },
];

// Simulación de turnos
let turnos = [
    { id: 1, paciente: 'Juan Pérez', dni: '12345678', fecha: '2023-06-01', hora: '09:00', especialidad: 'Medicina General', medico: 'Dr. García', estado: 'pendiente' },
    { id: 2, paciente: 'María García', dni: '87654321', fecha: '2023-06-02', hora: '10:30', especialidad: 'Cardiología', medico: 'Dra. Rodríguez', estado: 'aceptado' },
    { id: 3, paciente: 'Carlos López', dni: '23456789', fecha: '2023-06-03', hora: '11:00', especialidad: 'Neurología', medico: 'Dr. Martínez', estado: 'rechazado', motivoRechazo: 'Paciente no se presentó a la cita anterior' },
];

// Variables globales
let usuarioActual = null;
let horariosClinica = {
    inicio: '09:00',
    fin: '18:00'
};

// Función para mostrar el popup
function mostrarPopup(titulo, mensaje, mostrarConfirmar = false, callback = null) {
    document.getElementById('popup-title').textContent = titulo;
    document.getElementById('popup-message').textContent = mensaje;
    document.getElementById('popup').style.display = 'block';
    const confirmarBtn = document.getElementById('popup-confirm');
    const motivoRechazo = document.getElementById('motivoRechazo');
    
    if (mostrarConfirmar && usuarioActual && usuarioActual.rol === 'secretaria') {
        confirmarBtn.style.display = 'inline-block';
        motivoRechazo.style.display = 'block';
        confirmarBtn.onclick = callback;
    } else {
        confirmarBtn.style.display = 'none';
        motivoRechazo.style.display = 'none';
    }
}

// Función para cerrar el popup
document.getElementById('popup-close').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'none';
});

// Función para manejar el inicio de sesión
document.getElementById('formularioInicioSesion').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('password').value;
    
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (usuario) {
        usuarioActual = usuario;
        mostrarPopup('Inicio de sesión exitoso', `Bienvenido, ${usuario.rol}`);
        mostrarDashboard();
        actualizarNavegacion();
    } else {
        mostrarPopup('Error', 'Credenciales incorrectas');
    }
});

// Función para manejar la solicitud de turno
document.getElementById('formularioSolicitudTurno').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const dni = document.getElementById('dni').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const especialidad = document.getElementById('especialidad').value;
    const medicoEmail = document.getElementById('medico').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    
    const medicoSeleccionado = usuarios.find(u => u.email === medicoEmail);
    
    const nuevoTurno = {
        id: turnos.length + 1,
        paciente: nombre,
        dni: dni,
        fecha: fecha,
        hora: hora,
        especialidad: especialidad,
        medico: medicoSeleccionado.nombre,
        estado: usuarioActual && usuarioActual.rol === 'paciente' ? 'aceptado' : 'pendiente'
    };
    
    turnos.push(nuevoTurno);
    
    if (usuarioActual && usuarioActual.rol === 'paciente') {
        mostrarPopup('Turno aceptado', 'Su turno ha sido aceptado automáticamente.');
        actualizarTablaTurnos();
    } else {
        mostrarPopup('Solicitud recibida', 'Su solicitud de turno ha sido recibida. Le contactaremos pronto.');
    }
    
    this.reset();
    actualizarCalendario();
});

// Función para mostrar el dashboard
function mostrarDashboard() {
    document.getElementById('inicio').style.display = 'none';
    document.getElementById('solicitar-turno').style.display = 'none';
    document.getElementById('iniciar-sesion').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    document.getElementById('rolUsuario').textContent = `${usuarioActual.rol.charAt(0).toUpperCase() + usuarioActual.rol.slice(1)}: ${usuarioActual.nombre}, DNI: ${usuarioActual.dni}`;
    
    if (usuarioActual.rol === 'secretaria') {
        document.getElementById('filtrosTurnos').style.display = 'flex';
        document.getElementById('configuracionHorarios').style.display = 'block';
        document.getElementById('crearUsuario').style.display = 'block';
    } else {
        document.getElementById('filtrosTurnos').style.display = 'none';
        document.getElementById('configuracionHorarios').style.display = 'none';
        document.getElementById('crearUsuario').style.display = 'none';
    }
    
    if (usuarioActual.rol === 'paciente') {
        document.getElementById('camposDatosPersonales').style.display = 'none';
        document.getElementById('datosUsuario').style.display = 'block';
        document.getElementById('nombreUsuario').textContent = usuarioActual.nombre;
        document.getElementById('dniUsuario').textContent = usuarioActual.dni;
    }
    
    actualizarTablaTurnos();
}

// Función para actualizar la tabla de turnos
function actualizarTablaTurnos() {
    const tabla = document.getElementById('tablaTurnos').getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';
    
    let turnosFiltrados = turnos;
    if (usuarioActual) {
        if (usuarioActual.rol === 'medico') {
            turnosFiltrados = turnos.filter(turno => turno.medico === usuarioActual.nombre && turno.estado === 'aceptado');
        } else if (usuarioActual.rol === 'paciente') {
            turnosFiltrados = turnos.filter(turno => turno.paciente === usuarioActual.nombre);
        }
    }
    
    turnosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    turnosFiltrados.forEach(turno => {
        const fila = tabla.insertRow();
        fila.insertCell(0).textContent = turno.paciente;
        fila.insertCell(1).textContent = turno.dni;
        fila.insertCell(2).textContent = turno.fecha;
        fila.insertCell(3).textContent = turno.hora;
        fila.insertCell(4).textContent = turno.especialidad;
        fila.insertCell(5).textContent = turno.medico;
        fila.insertCell(6).textContent = turno.estado;
        fila.insertCell(7).textContent = turno.motivoRechazo || '';
        
        const celdaAcciones = fila.insertCell(8);
        if (usuarioActual) {
            if (usuarioActual.rol === 'secretaria') {
                if (turno.estado === 'pendiente') {
                    const botonAceptar = document.createElement('button');
                    botonAceptar.textContent = 'Aceptar';
                    botonAceptar.className = 'btn';
                    botonAceptar.onclick = () => cambiarEstadoTurno(turno.id, 'aceptado');
                    celdaAcciones.appendChild(botonAceptar);
                    
                    const botonRechazar = document.createElement('button');
                    botonRechazar.textContent = 'Rechazar';
                    botonRechazar.className = 'btn btn-outline';
                    botonRechazar.onclick = () => solicitarMotivoRechazo(turno.id);
                    celdaAcciones.appendChild(botonRechazar);
                }
                const botonModificar = document.createElement('button');
                botonModificar.textContent = 'Modificar';
                botonModificar.className = 'btn';
                botonModificar.onclick = () => modificarTurno(turno);
                celdaAcciones.appendChild(botonModificar);
            } else if (usuarioActual.rol === 'medico') {
                const botonAsistencia = document.createElement('button');
                botonAsistencia.textContent = turno.asistio ? 'Asistió' : 'No asistió';
                botonAsistencia.className = 'btn';
                botonAsistencia.onclick = () => marcarAsistencia(turno.id, !turno.asistio);
                celdaAcciones.appendChild(botonAsistencia);
                
                const botonArchivo = document.createElement('input');
                botonArchivo.type = 'file';
                botonArchivo.onchange = (e) => cargarArchivo(turno.id, e.target.files[0]);
                celdaAcciones.appendChild(botonArchivo);
            } else if (usuarioActual.rol === 'paciente') {
                if (turno.archivo) {
                    const botonDescargar = document.createElement('button');
                    botonDescargar.textContent = 'Descargar archivo';
                    botonDescargar.className = 'btn';
                    botonDescargar.onclick = () => descargarArchivo(turno.archivo);
                    celdaAcciones.appendChild(botonDescargar);
                }
            }
        }
    });
}

// Función para cambiar el estado de un turno
function cambiarEstadoTurno(id, nuevoEstado, motivo = '') {
    const turno = turnos.find(t => t.id === id);
    if (turno) {
        turno.estado = nuevoEstado;
        if (nuevoEstado === 'rechazado') {
            turno.motivoRechazo = motivo;
        }
        actualizarTablaTurnos();
        mostrarPopup('Estado actualizado', `El turno ha sido ${nuevoEstado}.`);
    }
}

// Función para solicitar motivo de rechazo
function solicitarMotivoRechazo(id) {
    mostrarPopup('Rechazar turno', 'Por favor, ingrese el motivo del rechazo:', true, () => {
        const motivo = document.getElementById('motivoRechazo').value;
        if (motivo.trim() !== '') {
            cambiarEstadoTurno(id, 'rechazado', motivo);
            document.getElementById('popup').style.display = 'none';
        } else {
            alert('Debe ingresar un motivo para rechazar el turno.');
        }
    });
}

// Función para cerrar sesión
document.getElementById('cerrarSesion').addEventListener('click', function() {
    usuarioActual = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('inicio').style.display = 'block';
    document.getElementById('solicitar-turno').style.display = 'block';
    document.getElementById('iniciar-sesion').style.display = 'block';
    mostrarPopup('Sesión cerrada', 'Ha cerrado sesión exitosamente.');
    actualizarNavegacion();
});

// Función para cargar especialidades y médicos
function cargarEspecialidadesYMedicos() {
    const selectEspecialidad = document.getElementById('especialidad');
    const selectMedico = document.getElementById('medico');
    
    // Limpiar opciones existentes
    selectEspecialidad.innerHTML = '<option value="">Seleccione una especialidad</option>';
    selectMedico.innerHTML = '<option value="">Seleccione un médico</option>';
    
    // Obtener especialidades únicas con médicos
    const especialidades = [...new Set(usuarios.filter(u => u.rol === 'medico').map(u => u.especialidad))];
    
    especialidades.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp;
        option.textContent = esp;
        selectEspecialidad.appendChild(option);
    });
}

// Función para cargar médicos según la especialidad seleccionada
document.getElementById('especialidad').addEventListener('change', function() {
    const especialidad = this.value;
    const selectMedico = document.getElementById('medico');
    selectMedico.innerHTML = '<option value="">Seleccione un médico</option>';
    
    const medicosFiltrados = usuarios.filter(u => u.rol === 'medico' && u.especialidad === especialidad);
    medicosFiltrados.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.email;
        option.textContent = medico.nombre;
        selectMedico.appendChild(option);
    });
});

// Función para generar horarios disponibles
function generarHorariosDisponibles(fecha) {
    const horaInicio = new Date(`2000-01-01T${horariosClinica.inicio}`);
    const horaFin = new Date(`2000-01-01T${horariosClinica.fin}`);
    const intervalo = 30 * 60 * 1000; // 30 minutos en milisegundos
    
    const horarios = [];
    
    for (let hora = horaInicio; hora < horaFin; hora = new Date(hora.getTime() + intervalo)) {
        const horaFormateada = hora.toTimeString().slice(0, 5);
        
        // Verificar si el horario ya está ocupado
        const turnoExistente = turnos.find(t => t.fecha === fecha && t.hora === horaFormateada);
        
        horarios.push({
            hora: horaFormateada,
            disponible: !turnoExistente
        });
    }
    
    return horarios;
}

// Función para actualizar el calendario
function actualizarCalendario() {
    const calendarioContainer = document.getElementById('calendario-carrusel');
    calendarioContainer.innerHTML = '';
    
    const fechaActual = new Date();
    const primerDiaSemana = new Date(fechaActual);
    primerDiaSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
    
    for (let i = 0; i < 4; i++) { // Mostrar 4 semanas
        const semana = document.createElement('div');
        semana.className = 'semana';
        
        for (let j = 0; j < 7; j++) {
            const dia = new Date(primerDiaSemana);
            dia.setDate(primerDiaSemana.getDate() + (i * 7) + j);
            
            const diaElement = document.createElement('div');
            diaElement.className = 'dia';
            diaElement.textContent = dia.getDate();
            
            const fechaFormateada = dia.toISOString().split('T')[0];
            const turnosDia = turnos.filter(t => t.fecha === fechaFormateada);
            
            if (turnosDia.length === 0) {
                diaElement.classList.add('disponible');
            } else if (turnosDia.length < getNumeroTurnosPorDia()) {
                diaElement.classList.add('parcial');
            } else {
                diaElement.classList.add('no-disponible');
            }
            
            const horariosElement = document.createElement('div');
            horariosElement.className = 'horarios';
            
            generarHorariosDisponibles(fechaFormateada).forEach(horario => {
                const horarioElement = document.createElement('span');
                horarioElement.className = 'horario';
                horarioElement.textContent = horario.hora;
                horarioElement.onclick = () => seleccionarHorario(fechaFormateada, horario.hora);
                if (!horario.disponible) {
                    horarioElement.classList.add('no-disponible');
                }
                horariosElement.appendChild(horarioElement);
            });
            
            diaElement.appendChild(horariosElement);
            semana.appendChild(diaElement);
        }
        
        calendarioContainer.appendChild(semana);
    }
    
    // Desplazar hasta la primera fecha disponible
    const primerDiaDisponible = calendarioContainer.querySelector('.dia.disponible, .dia.parcial');
    if (primerDiaDisponible) {
        primerDiaDisponible.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
}

// Función para obtener el número de turnos por día
function getNumeroTurnosPorDia() {
    const horaInicio = new Date(`2000-01-01T${horariosClinica.inicio}`);
    const horaFin = new Date(`2000-01-01T${horariosClinica.fin}`);
    const intervalo = 30 * 60 * 1000; // 30 minutos en milisegundos
    return Math.floor((horaFin - horaInicio) / intervalo);
}

// Función para seleccionar un horario
function seleccionarHorario(fecha, hora) {
    document.getElementById('fecha').value = fecha;
    document.getElementById('hora').value = hora;
}

// Función para filtrar turnos (para la secretaria)
function filtrarTurnos() {
    const filtroNombre = document.getElementById('filtroNombre').value.toLowerCase();
    const filtroDNI = document.getElementById('filtroDNI').value;
    const filtroFechaInicio = document.getElementById('filtroFechaInicio').value;
    const filtroFechaFin = document.getElementById('filtroFechaFin').value;
    
    const turnosFiltrados = turnos.filter(turno => 
        (filtroNombre === '' || turno.paciente.toLowerCase().includes(filtroNombre)) &&
        (filtroDNI === '' || turno.dni.includes(filtroDNI)) &&
        (filtroFechaInicio === '' || turno.fecha >= filtroFechaInicio) &&
        (filtroFechaFin === '' || turno.fecha <= filtroFechaFin)
    );
    
    actualizarTablaTurnos(turnosFiltrados);
}

// Event listener para el botón de aplicar filtros
document.getElementById('aplicarFiltros').addEventListener('click', filtrarTurnos);

// Función para guardar la configuración de horarios
document.getElementById('guardarHorarios').addEventListener('click', function() {
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    
    if (horaInicio && horaFin) {
        horariosClinica.inicio = horaInicio;
        horariosClinica.fin = horaFin;
        mostrarPopup('Horarios actualizados', 'Los horarios de la clínica han sido actualizados.');
        actualizarCalendario();
    } else {
        mostrarPopup('Error', 'Por favor, ingrese horarios válidos.');
    }
});

// Función para crear un nuevo usuario
document.getElementById('formularioCrearUsuario').addEventListener('submit', function(e) {
    e.preventDefault();
    const nuevoNombre = document.getElementById('nuevoNombre').value;
    const nuevoDNI = document.getElementById('nuevoDNI').value;
    const nuevoEmail = document.getElementById('nuevoEmail').value;
    const nuevoPassword = document.getElementById('nuevoPassword').value;
    const nuevoRol = document.getElementById('nuevoRol').value;
    const nuevaEspecialidad = document.getElementById('nuevaEspecialidad').value;
    
    const nuevoUsuario = {
        id: usuarios.length + 1,
        email: nuevoEmail,
        password: nuevoPassword,
        rol: nuevoRol,
        nombre: nuevoNombre,
        dni: nuevoDNI
    };
    
    if (nuevoRol === 'medico') {
        nuevoUsuario.especialidad = nuevaEspecialidad;
    }
    
    usuarios.push(nuevoUsuario);
    mostrarPopup('Usuario creado', 'El nuevo usuario ha sido creado exitosamente.');
    this.reset();
    
    if (nuevoRol === 'medico') {
        cargarEspecialidadesYMedicos();
    }
});

// Función para modificar un turno (solo para secretaria)
function modificarTurno(turno) {
    // Aquí puedes implementar la lógica para modificar un turno
    // Por ejemplo, puedes mostrar un formulario con los datos actuales del turno
    // y permitir que la secretaria los modifique
    console.log('Modificar turno:', turno);
}

// Función para marcar asistencia (solo para médicos)
function marcarAsistencia(turnoId, asistio) {
    const turno = turnos.find(t => t.id === turnoId);
    if (turno) {
        turno.asistio = asistio;
        actualizarTablaTurnos();
        mostrarPopup('Asistencia marcada', `El paciente ${asistio ? 'asistió' : 'no asistió'} a la cita.`);
    }
}

// Función para cargar archivo (solo para médicos)
function cargarArchivo(turnoId, archivo) {
    const turno = turnos.find(t => t.id === turnoId);
    if (turno) {
        turno.archivo = archivo;
        actualizarTablaTurnos();
        mostrarPopup('Archivo cargado', 'El archivo se ha cargado correctamente.');
    }
}

// Función para descargar archivo (solo para pacientes)
function descargarArchivo(archivo) {
    // Aquí deberías implementar la lógica para descargar el archivo
    // Por ahora, solo mostraremos un mensaje
    mostrarPopup('Descarga de archivo', 'La descarga del archivo comenzará en breve.');
}

// Función para actualizar la navegación
function actualizarNavegacion() {
    const iniciarSesionNav = document.getElementById('iniciarSesionNav');
    const cerrarSesionNav = document.getElementById('cerrarSesionNav');
    
    if (usuarioActual) {
        iniciarSesionNav.style.display = 'none';
        cerrarSesionNav.style.display = 'block';
    } else {
        iniciarSesionNav.style.display = 'block';
        cerrarSesionNav.style.display = 'none';
    }
}

// Función para modificar datos del usuario
document.getElementById('modificarDatos').addEventListener('click', function() {
    const nombre = prompt('Ingrese su nuevo nombre:', usuarioActual.nombre);
    const dni = prompt('Ingrese su nuevo DNI:', usuarioActual.dni);
    const telefono = prompt('Ingrese su nuevo teléfono:', usuarioActual.telefono);
    
    if (nombre && dni && telefono) {
        usuarioActual.nombre = nombre;
        usuarioActual.dni = dni;
        usuarioActual.telefono = telefono;
        document.getElementById('nombreUsuario').textContent = nombre;
        document.getElementById('dniUsuario').textContent = dni;
        mostrarPopup('Datos actualizados', 'Sus datos han sido actualizados correctamente.');
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Ocultar el dashboard inicialmente
    document.getElementById('dashboard').style.display = 'none';
    
    // Cargar especialidades y médicos
    cargarEspecialidadesYMedicos();
    
    // Inicializar el calendario
    actualizarCalendario();
    
    // Mostrar horarios actuales de la clínica
    document.getElementById('horaInicio').value = horariosClinica.inicio;
    document.getElementById('horaFin').value = horariosClinica.fin;
    
    // Event listener para mostrar/ocultar el campo de especialidad en el formulario de crear usuario
    document.getElementById('nuevoRol').addEventListener('change', function() {
        document.getElementById('especialidadMedico').style.display = this.value === 'medico' ? 'block' : 'none';
    });
    
    // Inicializar la navegación
    actualizarNavegacion();
});

// ... (código anterior sin cambios) ...

// Función para generar horarios disponibles
function generarHorariosDisponibles(fecha) {
    const horaInicio = new Date(`2000-01-01T${horariosClinica.inicio}`);
    const horaFin = new Date(`2000-01-01T${horariosClinica.fin}`);
    const intervalo = 20 * 60 * 1000; // 20 minutos en milisegundos
    
    const horarios = [];
    
    for (let hora = horaInicio; hora < horaFin; hora = new Date(hora.getTime() + intervalo)) {
        const horaFormateada = hora.toTimeString().slice(0, 5);
        
        // Verificar si el horario ya está ocupado
        const turnoExistente = turnos.find(t => t.fecha === fecha && t.hora === horaFormateada);
        
        horarios.push({
            hora: horaFormateada,
            disponible: !turnoExistente
        });
    }
    
    return horarios;
}

// Función para actualizar el calendario
function actualizarCalendario() {
    const calendarioContainer = document.getElementById('calendario-carrusel');
    calendarioContainer.innerHTML = '';
    
    const fechaActual = new Date();
    
    for (let i = 0; i < 3; i++) {
        const dia = new Date(fechaActual);
        dia.setDate(fechaActual.getDate() + i);
        
        const diaElement = document.createElement('div');
        diaElement.className = 'dia';
        
        const fechaFormateada = dia.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
        diaElement.innerHTML = `<div class="dia-fecha">${fechaFormateada}</div>`;
        
        const horariosElement = document.createElement('div');
        horariosElement.className = 'horarios';
        
        const horarios = generarHorariosDisponibles(dia.toISOString().split('T')[0]);
        horarios.forEach((horario, index) => {
            if (index < 4 || document.getElementById('verMas').textContent === 'ver menos') {
                const horarioElement = document.createElement('button');
                horarioElement.className = 'horario';
                horarioElement.textContent = horario.hora;
                horarioElement.onclick = () => seleccionarHorario(dia.toISOString().split('T')[0], horario.hora);
                if (!horario.disponible) {
                    horarioElement.disabled = true;
                    horarioElement.style.opacity = '0.5';
                }
                horariosElement.appendChild(horarioElement);
            }
        });
        
        diaElement.appendChild(horariosElement);
        calendarioContainer.appendChild(diaElement);
    }
}

// Función para seleccionar un horario
function seleccionarHorario(fecha, hora) {
    document.getElementById('fecha').value = fecha;
    document.getElementById('hora').value = hora;
}

// Event listener para el botón "ver más"
document.getElementById('verMas').addEventListener('click', function() {
    const verMasBtn = document.getElementById('verMas');
    if (verMasBtn.textContent === 'ver más') {
        verMasBtn.textContent = 'ver menos';
    } else {
        verMasBtn.textContent = 'ver más';
    }
    actualizarCalendario();
});

// ... (resto del código JavaScript sin cambios) ...

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // ... (código de inicialización anterior) ...
    
    // Inicializar el calendario
    actualizarCalendario();
    
    // ... (resto del código de inicialización) ...
});