const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { getAllPatients, getProfessionalPatients, assignPatient, addPatient, deletePatient } = require('../controllers/patientController');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas
router.get('/', getAllPatients);
router.get('/professional/:professionalId', getProfessionalPatients);
router.put('/:patientId/assign', assignPatient);
router.post('/', addPatient);
router.delete('/:id', deletePatient);

module.exports = router; 