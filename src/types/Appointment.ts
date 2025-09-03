export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'regular' | 'first_time' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  audioNote?: string;
  sessionCost?: number;
  attended?: boolean;
  paymentAmount?: number;
  remainingBalance?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
} 

export enum AppointmentStatus{
  scheduled = 'scheduled',
  completed = 'completed',
  cancelled ='cancelled',
}