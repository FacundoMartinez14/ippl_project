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
} = require('../controllers/statusRequestController');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas para profesionales
router.get('/professional/:professionalId', authenticateToken, checkRole(['professional']), getProfessionalRequests);
router.post('/status-change', authenticateToken, checkRole(['professional']), createRequest);

// Rutas para admin
router.get('/pending', authenticateToken, checkRole(['admin', 'financial']), getPendingRequests);
router.post('/:requestId/approve', authenticateToken, checkRole(['admin', 'financial']), approveRequest);
router.post('/:requestId/reject', authenticateToken, checkRole(['admin', 'financial']), rejectRequest);

module.exports = router; 