import { Routes } from '@angular/router';

export const legacyRoutes: Routes = [
  { path: 'signin', redirectTo: 'login', pathMatch: 'full' },
  { path: 'two-factor', redirectTo: 'two-factor/verify', pathMatch: 'full' },
  { path: 'internal/inactive', redirectTo: 'access/inactive', pathMatch: 'full' },
  { path: 'underwriter/applications/:applicationId', redirectTo: 'underwriter/applications/:applicationId/review', pathMatch: 'full' }
];
