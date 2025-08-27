const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  getActivities, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount,
  clearAllActivities,
  createActivity
} = require('../controllers/activityController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Create activity
router.post('/', createActivity);

// Obtener todas las actividades
router.get('/', getActivities);

// Obtener conteo de actividades no leídas
router.get('/unread-count', getUnreadCount);

// Marcar una actividad como leída
router.put('/:id/read', markAsRead);

// Marcar todas las actividades como leídas
router.put('/read-all', markAllAsRead);

// Limpiar todas las actividades
router.delete('/clear-all', clearAllActivities);

module.exports = router; 