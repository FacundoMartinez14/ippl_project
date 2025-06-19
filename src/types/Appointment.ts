export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: 'regular' | 'first_time' | 'emergency';
  notes?: string;
  audioNote?: string;
  status: 'pending' | 'completed' | 'cancelled';
  patientName?: string;
  professionalName?: string;
} 