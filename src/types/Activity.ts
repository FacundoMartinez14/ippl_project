export type ActivityType = 
  | 'NEW_POST' 
  | 'NEW_PATIENT' 
  | 'APPOINTMENT_COMPLETED'
  | 'PATIENT_DISCHARGE_REQUEST'
  | 'NEW_MESSAGE';

export interface Activity {
  _id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  metadata?: {
    patientId?: string;
    patientName?: string;
    professionalId?: string;
    professionalName?: string;
    postId?: string;
    postTitle?: string;
    appointmentId?: string;
    reason?: string;
  };
  read: boolean;
} 