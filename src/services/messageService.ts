import axios from 'axios';
import { API_URL } from '../config/config';

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
}

export const messageService = {
  // Submit a new contact message
  async submitMessage(data: { name: string; email: string; message: string }) {
    const response = await axios.post(`${API_URL}/api/messages`, data);
    return response.data;
  },

  // Get all messages with optional status filter
  async getMessages(status?: string) {
    const response = await axios.get(`${API_URL}/api/messages${status ? `?status=${status}` : ''}`);
    return response.data;
  },

  // Update message status
  async updateMessageStatus(id: string, status: 'new' | 'read' | 'archived') {
    const response = await axios.patch(`${API_URL}/api/messages/${id}/status`, { status });
    return response.data;
  },

  // Delete a message
  async deleteMessage(id: string) {
    const response = await axios.delete(`${API_URL}/api/messages/${id}`);
    return response.data;
  },

  async getAllMessages() {
    const response = await axios.get<Message[]>(`${API_URL}/api/messages`);
    return response.data;
  },

  async createMessage(message: Omit<Message, '_id' | 'fecha' | 'leido'>) {
    const response = await axios.post<Message>(`${API_URL}/api/messages`, message);
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await axios.put<{ success: boolean }>(`${API_URL}/api/messages/${id}/read`);
    return response.data;
  }
}; 