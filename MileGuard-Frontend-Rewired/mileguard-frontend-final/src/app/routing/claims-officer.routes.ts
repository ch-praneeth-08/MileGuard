import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { roleGuard } from '../core/guards/role-guard';
import { AuthenticatedShell } from '../layout/authenticated-shell/authenticated-shell';
import { ClaimsOfficerShell } from '../layout/claims-officer-shell/claims-officer-shell';

export const claimsOfficerRoutes: Routes = [{
  path: 'claims-officer', canActivate: [authGuard, roleGuard], data: { roles: ['Claims Adjuster', 'ClaimsOfficer', 'Claims Officer'] }, component: AuthenticatedShell, children: [{
    path: '', component: ClaimsOfficerShell, children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('../features/claims/pages/claims-officer-queue/claims-officer-queue').then(m => m.ClaimsOfficerQueue) },
      { path: 'claims', loadComponent: () => import('../features/claims/pages/claims-officer-queue/claims-officer-queue').then(m => m.ClaimsOfficerQueue) },
      { path: 'claims/:claimId', loadComponent: () => import('../features/claims/pages/claims-officer-claim-detail/claims-officer-claim-detail').then(m => m.ClaimsOfficerClaimDetailPage) }
    ]
  }]
}, { path: 'claims-officer/claims/:claimId/legacy', redirectTo: 'claims-officer/claims/:claimId', pathMatch: 'full' }];
