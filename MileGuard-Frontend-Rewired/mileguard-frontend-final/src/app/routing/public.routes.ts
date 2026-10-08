import { Routes } from '@angular/router';
import { PublicShell } from '../layout/public-shell/public-shell';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('../features/identity/pages/landing/landing').then(m => m.Landing)
      }
    ]
  }
];
