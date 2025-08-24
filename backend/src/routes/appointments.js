const express = require('express');
const router = express.Router();
const appointmentMiddleWare = require('../middleware/appointment');
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

router.put('/:id',
  authenticateToken,
  preloadAppointmentForWrite,
  updateAppointment
);

router.delete('/:id',
  authenticateToken,
  preloadAppointmentForWrite,
  deleteAppointment
);

module.exports = router;