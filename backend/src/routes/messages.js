const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Helper function to read messages
async function readMessages() {
    try {
        const data = await fs.readFile(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(data);
        // Asegurarse de que siempre devolvemos un array
        return Array.isArray(messages) ? messages : [];
    } catch (error) {
        return [];
    }
}

// Helper function to write messages
async function writeMessages(messages) {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Submit a new contact message
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido, correoElectronico, mensaje } = req.body;
        
        if (!nombre || !correoElectronico || !mensaje) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const messages = await readMessages();
        const newMessage = {
            _id: Date.now().toString(),
            nombre,
            apellido,
            correoElectronico,
            mensaje,
            fecha: new Date().toISOString(),
            leido: false
        };

        messages.push(newMessage);
        await writeMessages(messages);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Error al guardar el mensaje' });
    }
});

// Get all messages
router.get('/', async (req, res) => {
    try {
        const messages = await readMessages();
        res.json(messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ error: 'Error al recuperar los mensajes' });
    }
});

// Mark message as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await readMessages();
        const messageIndex = messages.findIndex(msg => msg._id === id);
        
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        messages[messageIndex].leido = true;
        await writeMessages(messages);

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Error al marcar el mensaje como leído' });
    }
});

// Delete all messages
router.delete('/clear-all', async (req, res) => {
    try {
        await writeMessages([]);
        res.json({ success: true, message: 'Todos los mensajes han sido eliminados' });
    } catch (error) {
        console.error('Error clearing messages:', error);
        res.status(500).json({ error: 'Error al eliminar los mensajes' });
    }
});

module.exports = router; 