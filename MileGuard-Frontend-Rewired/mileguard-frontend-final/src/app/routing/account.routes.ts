import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { AuthenticatedShell } from '../layout/authenticated-shell/authenticated-shell';

export const accountRoutes: Routes = [
  {
    path: 'account',
    canActivate: [authGuard],
    component: AuthenticatedShell,
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('../features/account/pages/account-profile/account-profile')
            .then(m => m.AccountProfile)
      }
    ]
  }
];
