import { Routes } from '@angular/router';
import { PublicShell } from '../layout/public-shell/public-shell';

export const authRoutes: Routes = [
  {
    path: '',
    component: PublicShell,
    children: [
      { path: 'login', loadComponent: () => import('../features/identity/pages/sign-in/sign-in').then(m => m.SignIn) },
      { path: 'register', loadComponent: () => import('../features/identity/pages/customer-registration/customer-registration').then(m => m.CustomerRegistration) },
      { path: 'register/success', loadComponent: () => import('../features/identity/pages/customer-registration-success/customer-registration-success').then(m => m.CustomerRegistrationSuccess) },
      { path: 'internal/register', loadComponent: () => import('../features/identity/pages/internal-registration/internal-registration').then(m => m.InternalRegistration) },
      { path: 'internal/register/submitted', loadComponent: () => import('../features/identity/pages/internal-registration-submitted/internal-registration-submitted').then(m => m.InternalRegistrationSubmitted) },
      { path: 'access/pending', loadComponent: () => import('../features/identity/pages/pending/pending').then(m => m.Pending) },
      { path: 'access/rejected', loadComponent: () => import('../features/identity/pages/rejected/rejected').then(m => m.Rejected) },
      { path: 'access/inactive', loadComponent: () => import('../features/identity/pages/inactive/inactive').then(m => m.Inactive) },
      { path: 'two-factor/setup', loadComponent: () => import('../features/identity/pages/two-factor-setup/two-factor-setup').then(m => m.TwoFactorSetup) },
      { path: 'two-factor/setup/confirm', redirectTo: 'two-factor/setup', pathMatch: 'full' },
      { path: 'two-factor/setup/success', loadComponent: () => import('../features/identity/pages/two-factor-enabled/two-factor-enabled').then(m => m.TwoFactorEnabled) },
      { path: 'two-factor/verify', loadComponent: () => import('../features/identity/pages/two-factor-challenge/two-factor-challenge').then(m => m.TwoFactorChallenge) },
      { path: 'session-expired', loadComponent: () => import('../features/identity/pages/session-expired/session-expired').then(m => m.SessionExpired) },
      { path: 'access-denied', loadComponent: () => import('../shared/feedback/workflow-state/workflow-state').then(m => m.WorkflowState), data: { eyebrow: 'Access', title: 'Access denied', message: 'You do not have permission to open this area.' } },
      { path: 'not-found', loadComponent: () => import('../shared/feedback/workflow-state/workflow-state').then(m => m.WorkflowState), data: { eyebrow: 'MileGuard', title: 'Page not found', message: 'The page you requested is not available.' } },
      { path: 'error', loadComponent: () => import('../shared/feedback/workflow-state/workflow-state').then(m => m.WorkflowState), data: { eyebrow: 'MileGuard', title: 'Something went wrong', message: 'We could not complete this request right now.' } },
      { path: 'service-unavailable', loadComponent: () => import('../shared/feedback/workflow-state/workflow-state').then(m => m.WorkflowState), data: { eyebrow: 'MileGuard', title: 'Service temporarily unavailable', message: 'This part of the MileGuard experience is temporarily unavailable. Please try again.' } },
      { path: 'conflict', loadComponent: () => import('../shared/feedback/workflow-state/workflow-state').then(m => m.WorkflowState), data: { eyebrow: 'MileGuard', title: 'State changed', message: 'The information you were working with has changed. Return and continue from the current state.' } }
    ]
  }
];
