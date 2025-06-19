import api from './api';
import { AxiosResponse } from 'axios';

export interface Activity {
  id: string;
  type: 'new_patient' | 'new_post' | 'new_appointment' | 'appointment_update' | 'post_update' | 'patient_update';
  description: string;
  timestamp: string;
  user: string;
  actor?: string;
}

const activityService = {
  getRecentActivities: async (limit: number = 10): Promise<Activity[]> => {
    try {
      const response: AxiosResponse<Activity[]> = await api.get(`/activities?limit=${limit}`);
      return response.data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error al obtener actividades recientes:', error);
      return [];
    }
  },

  // Esta función se puede llamar desde cualquier parte de la aplicación para registrar una nueva actividad
  logActivity: async (activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity | null> => {
    try {
      const response: AxiosResponse<Activity> = await api.post('/activities', {
        ...activity,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      return null;
    }
  },

  // Función auxiliar para formatear la fecha relativa
  getRelativeTime: (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};

export default activityService; 