import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthSession } from '../auth/auth-session';

export const roleGuard: CanActivateFn = (
  route
) => {
  const authSession =
    inject(AuthSession);

  const router =
    inject(Router);

  const currentUser =
    authSession.currentUser();

  if (!currentUser) {
    return router.createUrlTree([
      '/login'
    ]);
  }

  const allowedRoles =
    route.data?.['roles'] as
      string[] | undefined;

  if (
    !allowedRoles ||
    allowedRoles.length === 0
  ) {
    return true;
  }

  if (
    allowedRoles.includes(
      currentUser.role
    )
  ) {
    return true;
  }

  return router.createUrlTree([
    '/login'
  ]);
};
