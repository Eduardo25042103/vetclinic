import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.RegisterComponent)
  },
  {
    path: 'profile/owner',
    loadComponent: () =>
      import('./pages/profile-owner/profile-owner').then((m) => m.ProfileOwnerComponent)
  },
  {
    path: 'profile/vet',
    loadComponent: () =>
      import('./pages/profile-vet/profile-vet').then((m) => m.ProfileVetComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];