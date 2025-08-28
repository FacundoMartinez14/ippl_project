'use strict';
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireMessageManager, loadMessageById } = require('../middleware/message');
const messageController = require('../controllers/messageController');

// Ruta pública para enviar mensajes
router.post('/', messageController.createMessage);


// Rutas protegidas (requieren autenticación)
router.get('/', authenticateToken, requireMessageManager, messageController.getAllMessages);
// Marcar como leído (usa el middleware que precarga el mensaje)
router.put('/:id/read',
  authenticateToken,
  requireMessageManager,
  loadMessageById,
  messageController.markAsRead
);

// Ruta para limpiar todos los mensajes
router.delete('/clear-all',
  authenticateToken,
  requireMessageManager,
  messageController.clearAllMessages
);

module.exports = router; 