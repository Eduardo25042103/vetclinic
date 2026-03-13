export interface VeterinarianProfile {
  id: number;
  user_id: number;
  license_number: string;
  specialty: string;
  availability_start?: string; 
  availability_end?: string; 
}