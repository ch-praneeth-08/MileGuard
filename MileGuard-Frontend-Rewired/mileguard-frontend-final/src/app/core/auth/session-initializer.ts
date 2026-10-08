import { Injectable, inject } from '@angular/core';
import {
  catchError,
  of,
  switchMap,
  tap
} from 'rxjs';

import { AuthApi } from '../../features/identity/services/auth-api';
import { AuthSession } from './auth-session';
import { PreAuth } from './pre-auth';

@Injectable({
  providedIn: 'root'
})
export class SessionInitializer {
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSession);
  private readonly preAuth = inject(PreAuth);

  initialize() {
    return this.authApi
      .refresh()
      .pipe(
        tap(response => {
          this.authSession.setAccessToken(
            response.accessToken
          );
        }),

        switchMap(() =>
          this.authApi.getCurrentUser()
        ),

        tap(currentUser => {
          this.authSession.setCurrentUser(
            currentUser
          );
        }),

        catchError(() => {
          this.authSession.clear();
          this.preAuth.clear();

          return of(null);
        })
      );
  }
}
