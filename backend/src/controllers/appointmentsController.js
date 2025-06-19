const fs = require('fs').promises;
const path = require('path');

const APPOINTMENTS_FILE = path.join(__dirname, '../data/appointments.json');

const getAllAppointments = async (req, res) => {
  try {
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(data);
    res.json({ appointments });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

const getProfessionalAppointments = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(data);
    
    const professionalAppointments = appointments.filter(a => a.professionalId === professionalId);
    
    res.json({ appointments: professionalAppointments });
  } catch (error) {
    console.error('Error al obtener citas del profesional:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(data);
    
    const patientAppointments = appointments.filter(a => a.patientId === patientId);
    
    res.json({ appointments: patientAppointments });
  } catch (error) {
    console.error('Error al obtener citas del paciente:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

const createAppointment = async (req, res) => {
  try {
    console.log('[createAppointment] Iniciando creación de cita');
    console.log('[createAppointment] Datos recibidos:', req.body);
    
    const appointmentData = req.body;
    
    let data = { appointments: [] };
    try {
      console.log('[createAppointment] Intentando leer archivo de citas:', APPOINTMENTS_FILE);
      const fileContent = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
      data = JSON.parse(fileContent);
      console.log('[createAppointment] Archivo de citas leído correctamente');
    } catch (error) {
      console.error('[createAppointment] Error al leer archivo de citas:', error);
      if (error.code !== 'ENOENT') throw error;
    }
    
    // Verificar disponibilidad
    console.log('[createAppointment] Verificando disponibilidad del horario');
    const conflictingAppointment = data.appointments.find(a => 
      a.professionalId === appointmentData.professionalId &&
      a.date === appointmentData.date &&
      a.startTime === appointmentData.startTime &&
      a.status !== 'cancelled'
    );
    
    if (conflictingAppointment) {
      console.log('[createAppointment] Horario no disponible:', conflictingAppointment);
      return res.status(400).json({ message: 'El horario seleccionado no está disponible' });
    }

    // Obtener información del paciente y profesional
    console.log('[createAppointment] Obteniendo información de paciente y profesional');
    const patientsFile = path.join(__dirname, '../data/patients.json');
    const usersFile = path.join(__dirname, '../data/users.json');
    
    console.log('[createAppointment] Leyendo archivo de pacientes:', patientsFile);
    const patientsData = JSON.parse(await fs.readFile(patientsFile, 'utf8'));
    console.log('[createAppointment] Leyendo archivo de usuarios:', usersFile);
    const usersData = JSON.parse(await fs.readFile(usersFile, 'utf8'));

    const patient = patientsData.patients.find(p => p.id === appointmentData.patientId);
    const professional = usersData.users.find(u => u.id === appointmentData.professionalId);
    
    console.log('[createAppointment] Paciente encontrado:', patient?.name);
    console.log('[createAppointment] Profesional encontrado:', professional?.name);
    
    const newAppointment = {
      id: Date.now().toString(),
      ...appointmentData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      patientName: patient?.name || 'Paciente no encontrado',
      professionalName: professional?.name || 'Profesional no encontrado',
      audioNote: appointmentData.audioNote || null
    };

    // Verificar si hay audioNote y es una URL válida
    if (newAppointment.audioNote) {
      console.log('[createAppointment] Verificando URL de audio:', newAppointment.audioNote);
      if (!newAppointment.audioNote.startsWith('/uploads/')) {
        console.error('[createAppointment] URL de audio inválida:', newAppointment.audioNote);
        newAppointment.audioNote = null;
      }
    }
    
    data.appointments.push(newAppointment);
    
    console.log('[createAppointment] Guardando nueva cita en archivo');
    await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(data, null, 2));
    
    console.log('[createAppointment] Cita creada exitosamente:', newAppointment.id);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('[createAppointment] Error al crear cita:', error);
    console.error('[createAppointment] Stack trace:', error.stack);
    res.status(500).json({ message: 'Error al crear cita', error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    console.log('[updateAppointment] Iniciando actualización de cita');
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('[updateAppointment] ID de cita:', id);
    console.log('[updateAppointment] Datos de actualización:', updateData);
    
    console.log('[updateAppointment] Leyendo archivo de citas:', APPOINTMENTS_FILE);
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(data);
    
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    console.log('[updateAppointment] Índice de cita encontrada:', appointmentIndex);
    
    if (appointmentIndex === -1) {
      console.log('[updateAppointment] Cita no encontrada');
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    // Si se está actualizando el horario, verificar disponibilidad
    if (updateData.date && updateData.startTime) {
      console.log('[updateAppointment] Verificando disponibilidad del nuevo horario');
      const conflictingAppointment = appointments.find(a => 
        a.id !== id &&
        a.professionalId === appointments[appointmentIndex].professionalId &&
        a.date === updateData.date &&
        a.startTime === updateData.startTime &&
        a.status !== 'cancelled'
      );
      
      if (conflictingAppointment) {
        console.log('[updateAppointment] Horario no disponible:', conflictingAppointment);
        return res.status(400).json({ message: 'El horario seleccionado no está disponible' });
      }
    }

    // Verificar si hay audioNote y es una URL válida
    if (updateData.audioNote) {
      console.log('[updateAppointment] Verificando URL de audio:', updateData.audioNote);
      if (!updateData.audioNote.startsWith('/uploads/')) {
        console.error('[updateAppointment] URL de audio inválida:', updateData.audioNote);
        updateData.audioNote = null;
      }
    }
    
    // Actualizar la cita
    console.log('[updateAppointment] Actualizando cita');
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('[updateAppointment] Guardando cambios en archivo');
    await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify({ appointments }, null, 2));
    
    console.log('[updateAppointment] Cita actualizada exitosamente');
    res.json(appointments[appointmentIndex]);
  } catch (error) {
    console.error('[updateAppointment] Error al actualizar cita:', error);
    console.error('[updateAppointment] Stack trace:', error.stack);
    res.status(500).json({ message: 'Error al actualizar cita', error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(data);
    
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    // En lugar de eliminar, marcar como cancelada
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify({ appointments }, null, 2));
    
    res.json({ message: 'Cita cancelada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ message: 'Error al eliminar cita' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { date } = req.query;
    
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(data);
    
    // Obtener todas las citas del profesional para la fecha
    const dayAppointments = appointments.filter(a => 
      a.professionalId === professionalId &&
      a.date === date &&
      a.status !== 'cancelled'
    );
    
    // Generar todos los slots disponibles (9:00 - 17:00)
    const allSlots = Array.from({ length: 9 }, (_, i) => {
      const hour = i + 9;
      return `${hour.toString().padStart(2, '0')}:00`;
    });
    
    // Filtrar slots ocupados
    const availableSlots = allSlots.filter(slot => 
      !dayAppointments.some(a => a.startTime === slot)
    );
    
    res.json({ slots: availableSlots });
  } catch (error) {
    console.error('Error al obtener slots disponibles:', error);
    res.status(500).json({ message: 'Error al obtener slots disponibles' });
  }
};

const getUpcomingAppointments = async (req, res) => {
  try {
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(data);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= today && appointment.status === 'scheduled';
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ appointments: upcomingAppointments });
  } catch (error) {
    console.error('Error al obtener citas próximas:', error);
    res.status(500).json({ message: 'Error al obtener citas próximas' });
  }
};

module.exports = {
  getAllAppointments,
  getProfessionalAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getUpcomingAppointments
}; 