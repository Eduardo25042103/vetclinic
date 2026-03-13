import { Routes } from '@angular/router';

export const HISTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/history-list/history-list').then((m) => m.HistoryList)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/history-form/history-form').then((m) => m.HistoryForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/history-form/history-form').then((m) => m.HistoryForm)
  }
];