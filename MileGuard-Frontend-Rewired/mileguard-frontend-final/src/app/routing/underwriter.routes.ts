import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { roleGuard } from '../core/guards/role-guard';
import { AuthenticatedShell } from '../layout/authenticated-shell/authenticated-shell';
import { UnderwriterShell } from '../layout/underwriter-shell/underwriter-shell';

export const underwriterRoutes: Routes = [{
  path: 'underwriter', canActivate: [authGuard, roleGuard], data: { roles: ['Underwriter'] }, component: AuthenticatedShell, children: [{
    path: '', component: UnderwriterShell, children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('../features/underwriting/pages/underwriter-applications/underwriter-applications').then(m => m.UnderwriterApplications) },
      { path: 'applications', loadComponent: () => import('../features/underwriting/pages/underwriter-applications/underwriter-applications').then(m => m.UnderwriterApplications) },
      { path: 'applications/:applicationId/review', loadComponent: () => import('../features/underwriting/pages/underwriter-review/underwriter-review').then(m => m.UnderwriterReview) }
    ]
  }]
}, { path: 'underwriter/applications/:applicationId', redirectTo: 'underwriter/applications/:applicationId/review', pathMatch: 'full' }];
