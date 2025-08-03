const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const {
  getMedicalHistories,
  getMedicalHistoryById,
  createMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory
} = require('../controllers/medicalHistoryController');

// Obtener todos los historiales médicos (solo admin y profesionales)
router.get('/', authenticateToken, checkRole(['admin', 'professional']), getMedicalHistories);

// Obtener historiales médicos por paciente
router.get('/patient/:patientId', authenticateToken, checkRole(['admin', 'professional']), getMedicalHistories);

// Obtener historiales médicos por profesional
router.get('/professional/:professionalId', authenticateToken, checkRole(['admin', 'professional']), getMedicalHistories);

// Obtener un historial médico específico
router.get('/:id', authenticateToken, checkRole(['admin', 'professional']), getMedicalHistoryById);

// Crear un nuevo historial médico (solo profesionales)
router.post('/', authenticateToken, checkRole(['professional']), createMedicalHistory);

// Actualizar un historial médico (solo profesionales)
router.put('/:id', authenticateToken, checkRole(['professional']), updateMedicalHistory);

// Eliminar un historial médico (solo admin)
router.delete('/:id', authenticateToken, checkRole(['admin']), deleteMedicalHistory);

module.exports = router; 