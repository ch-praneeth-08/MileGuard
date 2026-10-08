import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { roleGuard } from '../core/guards/role-guard';
import { AuthenticatedShell } from '../layout/authenticated-shell/authenticated-shell';
import { AdminShell } from '../layout/admin-shell/admin-shell';

export const adminRoutes: Routes = [{
  path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['Admin'] }, component: AuthenticatedShell, children: [{
    path: '', component: AdminShell, children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('../features/admin/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'people', loadComponent: () => import('../features/identity/pages/admin-internal-users/admin-internal-users').then(m => m.AdminInternalUsers) },
      { path: 'people/registrations/:registrationId', loadComponent: () => import('../features/identity/pages/admin-registration-review/admin-registration-review').then(m => m.AdminRegistrationReview) },
      { path: 'people/users/:userId', loadComponent: () => import('../features/identity/pages/admin-user-detail/admin-user-detail').then(m => m.AdminUserDetail) },
      { path: 'customers', loadComponent: () => import('../features/customer-vehicle/pages/admin-unassigned-customers/admin-unassigned-customers').then(m => m.AdminUnassignedCustomers) },
      { path: 'assignments', redirectTo: 'assignments/customers', pathMatch: 'full' },
      { path: 'assignments/customers', loadComponent: () => import('../features/customer-vehicle/pages/admin-unassigned-customers/admin-unassigned-customers').then(m => m.AdminUnassignedCustomers) },
      { path: 'assignments/customers/:customerId', loadComponent: () => import('../features/customer-vehicle/pages/admin-assignment-review/admin-assignment-review').then(m => m.AdminAssignmentReview) },
      { path: 'underwriting', loadComponent: () => import('../features/underwriting/pages/admin-unassigned-applications/admin-unassigned-applications').then(m => m.AdminUnassignedApplications) },
      { path: 'underwriting/:applicationId', loadComponent: () => import('../features/underwriting/pages/admin-underwriting-review/admin-underwriting-review').then(m => m.AdminUnderwritingReview) },
      { path: 'claims', loadComponent: () => import('../features/claims/pages/admin-unassigned-claims/admin-unassigned-claims').then(m => m.AdminUnassignedClaims) },
      { path: 'claims/:claimId', loadComponent: () => import('../features/claims/pages/admin-claim-detail/admin-claim-detail').then(m => m.AdminClaimDetailPage) },
      { path: 'pricing', loadComponent: () => import('../features/quote-rating/pages/admin-pricing/admin-pricing').then(m => m.AdminPricing) }
    ]
  }]
}];
