import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { roleGuard } from '../core/guards/role-guard';
import { AuthenticatedShell } from '../layout/authenticated-shell/authenticated-shell';
import { CustomerShell } from '../layout/customer-shell/customer-shell';

export const customerRoutes: Routes = [{
  path: 'customer', canActivate: [authGuard, roleGuard], data: { roles: ['Customer'] }, component: AuthenticatedShell, children: [{
    path: '', component: CustomerShell, children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('../features/customer/pages/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboard) },
      { path: 'profile/setup', loadComponent: () => import('../features/customer-vehicle/pages/profile-setup/profile-setup').then(m => m.ProfileSetup) },
      { path: 'profile/edit', loadComponent: () => import('../features/customer-vehicle/pages/edit-customer-profile/edit-customer-profile').then(m => m.EditCustomerProfile) },
      { path: 'profile', loadComponent: () => import('../features/customer-vehicle/pages/customer-profile/customer-profile').then(m => m.CustomerProfile) },
      { path: 'driver', loadComponent: () => import('../features/customer-vehicle/pages/customer-driver/customer-driver').then(m => m.CustomerDriver) },
      { path: 'vehicles', loadComponent: () => import('../features/customer-vehicle/pages/customer-garage/customer-garage').then(m => m.CustomerGarage) },
      { path: 'vehicles/:vehicleId', loadComponent: () => import('../features/customer-vehicle/pages/customer-vehicle-detail/customer-vehicle-detail').then(m => m.CustomerVehicleDetail) },
      { path: 'underwriting', loadComponent: () => import('../features/underwriting/pages/customer-underwriting/customer-underwriting').then(m => m.CustomerUnderwriting) },
      { path: 'underwriting/:applicationId', loadComponent: () => import('../features/underwriting/pages/customer-underwriting-detail/customer-underwriting-detail').then(m => m.CustomerUnderwritingDetailPage) },
      { path: 'policies', loadComponent: () => import('../features/policy-billing/pages/customer-policies/customer-policies').then(m => m.CustomerPolicies) },
      { path: 'policies/:policyId', loadComponent: () => import('../features/policy-billing/pages/customer-policy-detail/customer-policy-detail').then(m => m.CustomerPolicyDetail) },
      { path: 'claims', loadComponent: () => import('../features/claims/pages/customer-claims/customer-claims').then(m => m.CustomerClaims) },
      { path: 'claims/:claimId', loadComponent: () => import('../features/claims/pages/customer-claim-detail/customer-claim-detail').then(m => m.CustomerClaimDetailPage) },
      { path: 'purchase/:applicationId', loadComponent: () => import('../features/policy-billing/pages/customer-purchase/customer-purchase').then(m => m.CustomerPurchase) }
    ]
  }]
}];
