import api from './api';

export interface FrequencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  currentFrequency: 'weekly' | 'biweekly' | 'monthly';
  requestedFrequency: 'weekly' | 'biweekly' | 'monthly';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFrequencyRequestDTO {
  patientId: string;
  newFrequency: 'weekly' | 'biweekly' | 'monthly';
  reason: string;
}

const frequencyRequestService = {
  // Crear una nueva solicitud
  createRequest: async (data: CreateFrequencyRequestDTO): Promise<FrequencyRequest> => {
    try {
      const response = await api.post<FrequencyRequest>('/frequency-requests', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw error;
    }
  },

  // Obtener todas las solicitudes pendientes
  getPendingRequests: async (): Promise<FrequencyRequest[]> => {
    try {
      const response = await api.get<FrequencyRequest[]>('/frequency-requests/pending');
      return response.data;
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      return [];
    }
  },

  // Obtener solicitudes de un paciente específico
  getPatientRequests: async (patientId: string): Promise<FrequencyRequest[]> => {
    try {
      const response = await api.get<FrequencyRequest[]>(`/frequency-requests/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener solicitudes del paciente:', error);
      return [];
    }
  },

  // Aprobar una solicitud
  approveRequest: async (requestId: string, adminResponse: string): Promise<FrequencyRequest> => {
    try {
      const response = await api.post<FrequencyRequest>(`/frequency-requests/${requestId}/approve`, {
        adminResponse
      });
      return response.data;
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      throw error;
    }
  },

  // Rechazar una solicitud
  rejectRequest: async (requestId: string, adminResponse: string): Promise<FrequencyRequest> => {
    try {
      const response = await api.post<FrequencyRequest>(`/frequency-requests/${requestId}/reject`, {
        adminResponse
      });
      return response.data;
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      throw error;
    }
  }
};

export default frequencyRequestService; 