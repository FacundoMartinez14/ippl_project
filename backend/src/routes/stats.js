const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { getSystemStats, getProfessionalStats } = require('../controllers/statsController');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener estadísticas generales del sistema (solo admin)
router.get('/system', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
}, getSystemStats);

// Obtener estadísticas de un profesional específico
router.get('/professional/:professionalId', (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.professionalId) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
}, getProfessionalStats);

module.exports = router; 