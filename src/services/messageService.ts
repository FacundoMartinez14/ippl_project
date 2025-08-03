import axios from 'axios';
import { API_URL } from '../config/config';

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
    const response = await axios.post(`${API_URL}/api/messages`, data);
    return response.data;
  },

  // Get all messages
  async getMessages() {
    const response = await axios.get<Message[]>(`${API_URL}/api/messages`);
    return response.data;
  },

  // Mark message as read
  async markAsRead(id: string) {
    const response = await axios.put<{ success: boolean }>(`${API_URL}/api/messages/${id}/read`);
    return response.data;
  },

  // Delete all messages
  async clearAllMessages() {
    const response = await axios.delete(`${API_URL}/api/messages/clear-all`);
    return response.data;
  }
}; 