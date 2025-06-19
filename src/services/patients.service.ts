import api from './api';
import { AxiosResponse } from 'axios';
import activityService from './activity.service';

export interface Patient {
  id: string;
  name: string;
  status: 'active' | 'pending';
  professionalId?: string;
  professionalName?: string;
  audioNote?: string;
  textNote?: string;
  description?: string;
  createdAt: string;
  assignedAt?: string;
  email?: string;
  phone?: string;
  nextAppointment?: string;
  sessionCost?: number;
  commission?: number;
}

export interface CreatePatientDTO {
  name: string;
  description: string;
}

export interface AssignPatientDTO {
  patientId: string;
  professionalId: string;
  professionalName: string;
  status?: 'active' | 'pending';
  assignedAt?: string;
  nextAppointment?: string;
  textNote?: string;
  audioNote?: string;
  sessionCost: number;
  commission: number;
}

const patientsService = {
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data.patients || [];
  },

  getProfessionalPatients: async (professionalId: string): Promise<Patient[]> => {
    const response = await api.get(`/patients/professional/${professionalId}`);
    return response.data.patients || [];
  },

  addPatient: async (patient: CreatePatientDTO): Promise<Patient> => {
    const response = await api.post<Patient>('/patients', patient);
    return response.data;
  },

  assignPatient: async (data: AssignPatientDTO): Promise<Patient> => {
    const response = await api.put(`/patients/${data.patientId}/assign`, data);
    return response.data;
  },

  uploadAudio: async (audioFile: File): Promise<string> => {
    try {
      console.log('Iniciando subida de audio:', audioFile.name, 'tipo:', audioFile.type);
      
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    const response = await api.post('/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
      console.log('Respuesta del servidor:', response.data);
      
      if (!response.data.audioUrl) {
        throw new Error('No se recibió la URL del audio del servidor');
      }
      
      return response.data.audioUrl;
    } catch (error: any) {
      console.error('Error detallado al subir audio:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Personalizar el mensaje de error según el tipo de error
      if (error.response?.status === 400) {
        throw new Error('El archivo de audio no es válido o no fue proporcionado');
      } else if (error.response?.status === 413) {
        throw new Error('El archivo de audio es demasiado grande');
      } else if (error.response?.status === 415) {
        throw new Error('El formato del archivo de audio no es soportado');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al subir el archivo de audio: ' + error.message);
      }
    }
  },

  createPatient: async (patientData: any): Promise<any> => {
    try {
      const response = await api.post('/patients', patientData);
      // Registrar la actividad
      await activityService.logActivity({
        type: 'new_patient',
        description: `Nuevo paciente registrado: ${patientData.name}`,
        actor: patientData.professionalName || 'Sistema'
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear paciente:', error);
      throw error;
    }
  },

  updatePatient: async (id: string, patientData: any): Promise<any> => {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      // Registrar la actividad
      await activityService.logActivity({
        type: 'patient_update',
        description: `Paciente actualizado: ${patientData.name}`,
        actor: patientData.professionalName || 'Sistema'
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      throw error;
    }
  },

  deletePatient: async (id: string): Promise<void> => {
    try {
      await api.delete(`/patients/${id}`);
      // Registrar la actividad
      await activityService.logActivity({
        type: 'patient_delete',
        description: `Paciente eliminado`,
        actor: 'Sistema'
      });
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      throw error;
    }
  }
};

export default patientsService; 