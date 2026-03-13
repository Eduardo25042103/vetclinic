import { RecordType } from './appointment';

export interface MedicalRecord {
  id: number;
  pet_id: number;
  veterinarian_id: number;
  appointment_id: number | null;
  record_type: RecordType;
  diagnosis: string;
  treatment: string;
  notes: string;
  created_at: string;
}