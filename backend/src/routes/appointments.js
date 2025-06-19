const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const {
  getAllAppointments,
  getProfessionalAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
  getUpcomingAppointments
} = require('../controllers/appointmentsController');
const fs = require('fs').promises;
const path = require('path');
const APPOINTMENTS_FILE = path.join(__dirname, '../data/appointments.json');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas públicas (requieren autenticación pero no roles específicos)
router.get('/professional/:professionalId', getProfessionalAppointments);
router.get('/patient/:patientId', getPatientAppointments);
router.get('/slots/:professionalId', getAvailableSlots);
router.get('/upcoming', getUpcomingAppointments);

// Rutas que requieren ser admin o el profesional asignado
router.get('/', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
}, getAllAppointments);

router.post('/', createAppointment);

router.put('/:id', async (req, res, next) => {
  try {
    console.log('[appointmentsRouter] Verificando permisos para actualizar cita');
    console.log('[appointmentsRouter] ID de cita:', req.params.id);
    console.log('[appointmentsRouter] Usuario:', req.user);
    
    const appointmentData = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(appointmentData);
    const appointment = appointments.find(a => a.id === req.params.id);
    
    if (!appointment) {
      console.log('[appointmentsRouter] Cita no encontrada');
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    console.log('[appointmentsRouter] Cita encontrada:', appointment);
    console.log('[appointmentsRouter] Rol de usuario:', req.user.role);
    console.log('[appointmentsRouter] ID de profesional de la cita:', appointment.professionalId);
    
    if (req.user.role !== 'admin' && req.user.id !== appointment.professionalId) {
      console.log('[appointmentsRouter] Acceso denegado - Usuario no autorizado');
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    console.log('[appointmentsRouter] Acceso autorizado');
    next();
  } catch (error) {
    console.error('[appointmentsRouter] Error al verificar permisos:', error);
    console.error('[appointmentsRouter] Stack trace:', error.stack);
    res.status(500).json({ message: 'Error al verificar permisos', error: error.message });
  }
}, updateAppointment);

router.delete('/:id', async (req, res, next) => {
  try {
    console.log('[appointmentsRouter] Verificando permisos para eliminar cita');
    console.log('[appointmentsRouter] ID de cita:', req.params.id);
    console.log('[appointmentsRouter] Usuario:', req.user);
    
    const appointmentData = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
    const { appointments } = JSON.parse(appointmentData);
    const appointment = appointments.find(a => a.id === req.params.id);
    
    if (!appointment) {
      console.log('[appointmentsRouter] Cita no encontrada');
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    console.log('[appointmentsRouter] Cita encontrada:', appointment);
    console.log('[appointmentsRouter] Rol de usuario:', req.user.role);
    console.log('[appointmentsRouter] ID de profesional de la cita:', appointment.professionalId);
    
    if (req.user.role !== 'admin' && req.user.id !== appointment.professionalId) {
      console.log('[appointmentsRouter] Acceso denegado - Usuario no autorizado');
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    console.log('[appointmentsRouter] Acceso autorizado');
    next();
  } catch (error) {
    console.error('[appointmentsRouter] Error al verificar permisos:', error);
    console.error('[appointmentsRouter] Stack trace:', error.stack);
    res.status(500).json({ message: 'Error al verificar permisos', error: error.message });
  }
}, deleteAppointment);

module.exports = router;