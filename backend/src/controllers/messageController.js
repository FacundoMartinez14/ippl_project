const messageService = require('../services/messageService');

const messageController = {
  // Create a new message
  async createMessage(req, res) {
    try {
      const message = await messageService.saveMessage(req.body);
      res.status(201).json({ message: 'Mensaje enviado exitosamente' });
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
  },

  // Get all messages
  async getAllMessages(req, res) {
    try {
      const messages = await messageService.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      res.status(500).json({ error: 'Error al obtener los mensajes' });
    }
  },

  // Mark message as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await messageService.markAsRead(id);
      res.json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
      res.status(500).json({ error: 'Error al actualizar el mensaje' });
    }
  }
};

module.exports = messageController; 