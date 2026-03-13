import { User } from '../../../core/models/user';
import { OwnerProfile } from '../../../core/models/owner-profile';
import { VeterinarianProfile } from '../../../core/models/veterinarian-profile';
import { RoleName } from '../../../core/models/role';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name:     string;
  username: string;
  email:    string;
  num:      string;
  password: string;
  role:     RoleName;
}

export interface AuthUser {
  user:       User;
  role:       RoleName;
  ownerProfile?: OwnerProfile;
  vetProfile?:   VeterinarianProfile;
}

export interface ProfileUpdatePayload {
  name?: string;
  num?:  string;
}