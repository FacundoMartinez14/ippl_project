import api from './api';

export interface Message {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export const messageService = {
  // Submit a new contact message
  async submitMessage(data: { nombre: string; apellido: string; correoElectronico: string; mensaje: string }) {
    const response = await api.post(`/messages`, data);
    return response;
  },

  // Get all messages
  async getMessages() {
    const response = await api.get<Message[]>(`/messages`);
    return response.data;
  },

  // Mark message as read
  async markAsRead(id: string) {
    const response = await api.put<{ success: boolean }>(`/messages/${id}/read`);
    return response.data;
  },

  // Delete all messages
  async clearAllMessages() {
    const response = await api.delete(`/messages/clear-all`);
    return response.data;
  }
}; 