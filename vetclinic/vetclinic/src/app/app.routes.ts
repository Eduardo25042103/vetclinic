import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'pets',
    loadChildren: () =>
      import('./modules/pets/pets.routes').then((m) => m.PETS_ROUTES)
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('./modules/appointments/appointments.routes').then((m) => m.APPOINTMENTS_ROUTES)
  },
  {
    path: 'history',
    loadChildren: () =>
      import('./modules/history/history.routes').then((m) => m.HISTORY_ROUTES)
  },
  { path: '**', redirectTo: '' }
];