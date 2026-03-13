export type AppointmentStatus = 'scheduled' | 'ongoing' | 'cancelled' | 'completed';
export type RecordType = 'scheduled' | 'emergency' | 'followup';

export interface Appointment {
  id: number;
  pet_id: number;
  veterinarian_id: number;
  datetime: string;
  duration_minutes: number;
  status: AppointmentStatus;
  reason: string;
}