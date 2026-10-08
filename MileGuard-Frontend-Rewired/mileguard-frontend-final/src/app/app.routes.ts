import { Routes } from '@angular/router';
import { publicRoutes } from './routing/public.routes';
import { authRoutes } from './routing/auth.routes';
import { customerRoutes } from './routing/customer.routes';
import { agentRoutes } from './routing/agent.routes';
import { underwriterRoutes } from './routing/underwriter.routes';
import { claimsOfficerRoutes } from './routing/claims-officer.routes';
import { adminRoutes } from './routing/admin.routes';
import { legacyRoutes } from './routing/legacy.routes';
import { accountRoutes } from './routing/account.routes';

export const routes: Routes = [
  ...publicRoutes,
  ...authRoutes,
  ...customerRoutes,
  ...agentRoutes,
  ...underwriterRoutes,
  ...claimsOfficerRoutes,
  ...adminRoutes,
  ...accountRoutes,
  ...legacyRoutes,
  { path: '**', redirectTo: 'not-found' }
];
