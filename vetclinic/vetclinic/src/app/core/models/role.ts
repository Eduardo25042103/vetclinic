export type RoleName = 'owner' | 'vet';

export interface Role {
  id: number;
  role_name: RoleName;
  description: string;
}