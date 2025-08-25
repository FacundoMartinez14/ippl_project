// src/routes/messages.js
'use strict';
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireMessageManager, loadMessageById } = require('../middleware/message');
const messageController = require('../controllers/messageController');

// Ruta pública para enviar mensajes
router.post('/messages', messageController.createMessage);

// Rutas protegidas (requieren autenticación)
router.get('/messages', authenticateToken, requireMessageManager, messageController.getAllMessages);
// Marcar como leído (usa el middleware que precarga el mensaje)
router.put('/messages/:id/read',
  authenticateToken,
  requireMessageManager,
  loadMessageById,
  messageController.markAsRead
);

// Ruta para limpiar todos los mensajes
router.delete('/messages/clear-all',
  authenticateToken,
  requireMessageManager,
  messageController.clearAllMessages
);

module.exports = router; 