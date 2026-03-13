import { Routes } from '@angular/router';

export const PETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pet-list/pet-list').then((m) => m.PetList)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/pet-form/pet-form').then((m) => m.PetForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/pet-form/pet-form').then((m) => m.PetForm)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/pet-detail/pet-detail').then((m) => m.PetDetail)
  }
];