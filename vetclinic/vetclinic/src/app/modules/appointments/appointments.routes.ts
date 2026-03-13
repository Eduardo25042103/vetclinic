import { Routes } from '@angular/router';

export const APPOINTMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/appointment-list/appointment-list').then((m) => m.AppointmentList)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/appointment-form/appointment-form').then((m) => m.AppointmentForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/appointment-form/appointment-form').then((m) => m.AppointmentForm)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/appointment-detail/appointment-detail').then((m) => m.AppointmentDetail)
  }
];