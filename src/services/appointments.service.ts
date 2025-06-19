import api from '../config/api';
import { AxiosResponse } from 'axios';
import activityService from './activity.service';

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  type: 'regular' | 'first_time' | 'emergency';
  patientName: string;
  professionalName: string;
}

export interface CreateAppointmentDTO {
  patientId: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'regular' | 'first_time' | 'emergency';
  notes?: string;
  audioNote?: string;
}

const appointmentsService = {
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<{ appointments: Appointment[] }>('/appointments');
    return response.data.appointments;
  },

  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<{ appointments: Appointment[] }>('/appointments/upcoming');
    return response.data.appointments;
  },

  getProfessionalAppointments: async (professionalId: string): Promise<Appointment[]> => {
    const response = await api.get<{ appointments: Appointment[] }>(`/appointments/professional/${professionalId}`);
    return response.data.appointments;
  },

  getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
    const response = await api.get<{ appointments: Appointment[] }>(`/appointments/patient/${patientId}`);
    return response.data.appointments;
  },

  createAppointment: async (appointmentData: any): Promise<any> => {
    try {
      const response = await api.post('/appointments', appointmentData);
      // Registrar la actividad
      await activityService.logActivity({
        type: 'new_appointment',
        description: `Nueva cita programada con ${appointmentData.patientName}`,
        actor: appointmentData.professionalName || 'Sistema'
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  },

  updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, appointment);
    return response.data;
  },

  deleteAppointment: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },

  getAvailableSlots: async (professionalId: string, date: string): Promise<string[]> => {
    const response = await api.get<{ slots: string[] }>(`/appointments/slots/${professionalId}`, {
      params: { date }
    });
    return response.data.slots;
  },

  updateAppointmentStatus: async (id: string, status: string, appointmentData: any): Promise<any> => {
    try {
      const response = await api.put(`/appointments/${id}/status`, { status });
      // Registrar la actividad
      const statusText = status === 'completed' ? 'completada' : 'actualizada';
      await activityService.logActivity({
        type: 'appointment_update',
        description: `Cita ${statusText} con ${appointmentData.patientName}`,
        actor: appointmentData.professionalName || 'Sistema'
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado de cita:', error);
      throw error;
    }
  }
};

export default appointmentsService; 