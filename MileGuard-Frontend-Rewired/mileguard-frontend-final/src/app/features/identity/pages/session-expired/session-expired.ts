import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthSession } from '../../../../core/auth/auth-session';
import { PreAuth } from '../../../../core/auth/pre-auth';

@Component({
  selector: 'app-session-expired',
  imports: [],
  templateUrl: './session-expired.html',
  styleUrl: './session-expired.css'
})
export class SessionExpired {
  private readonly authSession = inject(AuthSession);
  private readonly preAuth = inject(PreAuth);
  private readonly router = inject(Router);

  constructor() {
    this.authSession.clear();
    this.preAuth.clear();
  }

  signIn(): void {
    void this.router.navigate([
      '/login'
    ]);
  }
}
