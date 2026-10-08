import {
  Injectable,
  inject
} from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  tap
} from 'rxjs';

import {
  AuthApi
} from '../../features/identity/services/auth-api';
import {
  AuthSession
} from './auth-session';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionRestorer {
  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  private restoreRequest$:
    Observable<boolean> | null = null;

  private restoreAttempted =
    false;

  restore(): Observable<boolean> {
    if (
      this.authSession
        .isAuthenticated()
    ) {
      return of(true);
    }

    if (this.restoreRequest$) {
      return this.restoreRequest$;
    }

    if (this.restoreAttempted) {
      return of(false);
    }

    this.restoreAttempted =
      true;

    this.restoreRequest$ =
      this.authApi
        .refresh()
        .pipe(
          tap(response => {
            this.authSession
              .setAccessToken(
                response.accessToken
              );
          }),

          switchMap(() =>
            this.authApi
              .getCurrentUser()
          ),

          tap(currentUser => {
            this.authSession
              .setCurrentUser(
                currentUser
              );
          }),

          map(() => true),

          catchError(() => {
            this.authSession.clear();

            return of(false);
          }),

          finalize(() => {
            this.restoreRequest$ =
              null;
          }),

          shareReplay({
            bufferSize: 1,
            refCount: false
          })
        );

    return this.restoreRequest$;
  }

  reset(): void {
    this.restoreAttempted =
      false;
  }
}
