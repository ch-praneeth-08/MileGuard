import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth-guard';
import { roleGuard } from '../core/guards/role-guard';
import { AuthenticatedShell } from '../layout/authenticated-shell/authenticated-shell';
import { AgentShell } from '../layout/agent-shell/agent-shell';

export const agentRoutes: Routes = [{
  path: 'agent', canActivate: [authGuard, roleGuard], data: { roles: ['Agent'] }, component: AuthenticatedShell, children: [{
    path: '', component: AgentShell, children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('../features/agent/pages/agent-dashboard/agent-dashboard').then(m => m.AgentDashboard) },
      { path: 'customers', loadComponent: () => import('../features/customer-vehicle/pages/agent-my-customers/agent-my-customers').then(m => m.AgentMyCustomers) },
      { path: 'customers/:customerId', loadComponent: () => import('../features/customer-vehicle/pages/agent-customer-workspace/agent-customer-workspace').then(m => m.AgentCustomerWorkspace) },
      { path: 'customers/:customerId/vehicles/new', loadComponent: () => import('../features/customer-vehicle/pages/agent-add-vehicle/agent-add-vehicle').then(m => m.AgentAddVehicle) },
      { path: 'customers/:customerId/vehicles/:vehicleId', loadComponent: () => import('../features/customer-vehicle/pages/agent-vehicle-detail/agent-vehicle-detail').then(m => m.AgentVehicleDetail) },
      { path: 'customers/:customerId/quotes', loadComponent: () => import('../features/quote-rating/pages/agent-quotes/agent-quotes').then(m => m.AgentQuotes) },
      { path: 'customers/:customerId/quotes/start', loadComponent: () => import('../features/quote-rating/pages/quote-vehicle-selection/quote-vehicle-selection').then(m => m.QuoteVehicleSelection) },
      { path: 'customers/:customerId/quotes/:quoteId', loadComponent: () => import('../features/quote-rating/pages/quote-workspace/quote-workspace').then(m => m.QuoteWorkspace) },
      { path: 'customers/:customerId/policies', loadComponent: () => import('../features/policy-billing/pages/agent-customer-policies/agent-customer-policies').then(m => m.AgentCustomerPolicies) },
      { path: 'customers/:customerId/policies/:policyId', loadComponent: () => import('../features/policy-billing/pages/agent-policy-detail/agent-policy-detail').then(m => m.AgentPolicyDetail) },
      { path: 'customers/:customerId/claims', loadComponent: () => import('../features/claims/pages/agent-customer-claims/agent-customer-claims').then(m => m.AgentCustomerClaims) },
      { path: 'customers/:customerId/claims/new', loadComponent: () => import('../features/claims/pages/agent-new-claim/agent-new-claim').then(m => m.AgentNewClaim) },
      { path: 'customers/:customerId/claims/:claimId', loadComponent: () => import('../features/claims/pages/agent-claim-detail/agent-claim-detail').then(m => m.AgentClaimDetailPage) },
      { path: 'quotes', redirectTo: 'customers' },
      { path: 'underwriting', redirectTo: 'customers' },
      { path: 'claims', redirectTo: 'customers' }
    ]
  }]
}];
