const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const activityController = require('../controllers/activityController');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener actividades recientes
router.get('/', activityController.getRecentActivities);

// Registrar una nueva actividad
router.post('/', activityController.logActivity);

module.exports = router; 