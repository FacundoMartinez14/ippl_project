const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAllPatients, getProfessionalPatients, assignPatient, addPatient, deletePatient, requestDischargePatient, requestActivationPatient } = require('../controllers/patientController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas
router.get('/', getAllPatients);
router.get('/professional/:professionalId', getProfessionalPatients);
router.put('/:patientId/assign', assignPatient);
router.post('/', addPatient);
router.delete('/:id', deletePatient);
router.post('/:patientId/request-discharge', requestDischargePatient);
router.post('/:patientId/request-activation', requestActivationPatient);

module.exports = router; 