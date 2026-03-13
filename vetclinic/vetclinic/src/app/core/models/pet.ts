export type PetSpecies = 'dog' | 'cat' | 'bunny';

export interface Pet {
  id: number;
  name: string;
  species: PetSpecies;
  breed: string;
  birth_date: string;
  owner_id: number;
}