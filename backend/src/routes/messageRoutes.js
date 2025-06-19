const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

const messagesFilePath = path.join(__dirname, '../data/messages.json');

// Ruta pública para enviar mensajes
router.post('/messages', messageController.createMessage);

// Rutas protegidas (requieren autenticación)
router.get('/messages', authenticateToken, messageController.getAllMessages);
router.put('/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(messagesFilePath, 'utf8');
        let { messages } = JSON.parse(data);
        
        // Encontrar y actualizar el mensaje específico
        messages = messages.map(msg => 
            msg._id === id ? { ...msg, leido: true } : msg
        );
        
        await fs.writeFile(messagesFilePath, JSON.stringify({ messages }, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
        res.status(500).json({ error: 'Error al actualizar el mensaje' });
    }
});

module.exports = router; 