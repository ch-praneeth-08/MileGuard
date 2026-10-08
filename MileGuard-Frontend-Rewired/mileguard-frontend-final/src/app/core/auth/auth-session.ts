import {
  Injectable,
  computed,
  signal
} from '@angular/core';

import {
  CurrentUser
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthSession {
  private readonly accessTokenSignal =
    signal<string | null>(null);

  private readonly currentUserSignal =
    signal<CurrentUser | null>(null);

  readonly currentUser =
    this.currentUserSignal.asReadonly();

  readonly isAuthenticated =
    computed(
      () =>
        !!this.accessTokenSignal() &&
        !!this.currentUserSignal()
    );

  get accessToken():
    string | null {
    return this.accessTokenSignal();
  }

  setAccessToken(
    accessToken: string
  ): void {
    this.accessTokenSignal.set(
      accessToken
    );
  }

  setCurrentUser(
    currentUser: CurrentUser
  ): void {
    this.currentUserSignal.set(
      currentUser
    );
  }

  clear(): void {
    this.accessTokenSignal.set(null);

    this.currentUserSignal.set(null);
  }
}
