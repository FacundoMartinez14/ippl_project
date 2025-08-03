import api from '../config/api';
import { StatusRequest } from '../types/StatusRequest';

const statusRequestService = {
  createRequest: async (data: Omit<StatusRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<StatusRequest> => {
    const response = await api.post<StatusRequest>('/status-requests', data);
    return response.data;
  },

  getPendingRequests: async (): Promise<StatusRequest[]> => {
    const response = await api.get<{ requests: StatusRequest[] }>('/status-requests/pending');
    console.log('DEBUG: Solicitudes pendientes recibidas', response.data.requests.map(r => r.id));
    return response.data.requests;
  },

  getProfessionalRequests: async (professionalId: string): Promise<StatusRequest[]> => {
    const response = await api.get<{ requests: StatusRequest[] }>(`/status-requests/professional/${professionalId}`);
    return response.data.requests;
  },

  approveRequest: async (requestId: string, adminResponse?: string): Promise<StatusRequest> => {
    const response = await api.post<StatusRequest>(`/status-requests/${requestId}/approve`, { adminResponse });
    return response.data;
  },

  rejectRequest: async (requestId: string, adminResponse?: string): Promise<StatusRequest> => {
    const response = await api.post<StatusRequest>(`/status-requests/${requestId}/reject`, { adminResponse: adminResponse || 'Rechazado por el administrador' });
    return response.data;
  }
};

export default statusRequestService; 