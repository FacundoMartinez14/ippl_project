const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const {
  createRequest,
  getPendingRequests,
  getProfessionalRequests,
  approveRequest,
  rejectRequest,
  requestFrequencyChange
} = require('../controllers/statusRequestController');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas para profesionales
router.get('/professional/:professionalId', authenticateToken, checkRole(['professional']), getProfessionalRequests);
router.post('/status-change', authenticateToken, checkRole(['professional']), createRequest);
router.post('/frequency-change/:patientId', authenticateToken, checkRole(['professional']), requestFrequencyChange);

// Rutas para admin
router.get('/pending', authenticateToken, checkRole(['admin']), getPendingRequests);
router.post('/:requestId/approve', authenticateToken, checkRole(['admin']), approveRequest);
router.post('/:requestId/reject', authenticateToken, checkRole(['admin']), rejectRequest);

module.exports = router; 