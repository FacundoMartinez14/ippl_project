const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Helper function to read messages
async function readMessages() {
    try {
        const data = await fs.readFile(MESSAGES_FILE, 'utf8');
        return JSON.parse(data);
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
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const messages = await readMessages();
        const newMessage = {
            id: Date.now().toString(),
            name,
            email,
            message,
            status: 'new',
            createdAt: new Date().toISOString()
        };

        messages.push(newMessage);
        await writeMessages(messages);

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Error saving message' });
    }
});

// Get all messages with optional status filter
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const messages = await readMessages();
        
        if (status) {
            const filteredMessages = messages.filter(msg => msg.status === status);
            return res.json(filteredMessages);
        }
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving messages' });
    }
});

// Update message status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['new', 'read', 'archived'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const messages = await readMessages();
        const messageIndex = messages.findIndex(msg => msg.id === id);
        
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }

        messages[messageIndex].status = status;
        await writeMessages(messages);

        res.json(messages[messageIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error updating message status' });
    }
});

// Delete a message
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await readMessages();
        const messageIndex = messages.findIndex(msg => msg.id === id);
        
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }

        messages.splice(messageIndex, 1);
        await writeMessages(messages);

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting message' });
    }
});

module.exports = router; 