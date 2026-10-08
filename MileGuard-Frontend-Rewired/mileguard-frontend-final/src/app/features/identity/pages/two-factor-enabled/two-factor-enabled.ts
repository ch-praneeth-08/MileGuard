import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthSession } from '../../../../core/auth/auth-session';

@Component({
  selector: 'app-two-factor-enabled',
  imports: [],
  templateUrl: './two-factor-enabled.html',
  styleUrl: './two-factor-enabled.css'
})
export class TwoFactorEnabled {
  private readonly authSession =
    inject(AuthSession);

  private readonly router =
    inject(Router);

  readonly currentUser =
    this.authSession.currentUser;

  continueToDashboard(): void {
    const user =
      this.authSession.currentUser();

    const accessToken =
      this.authSession.accessToken;

    if (!user || !accessToken) {
      void this.router.navigate([
        '/login'
      ]);

      return;
    }

    switch (user.role) {
      case 'Admin':
        void this.router.navigate([
          '/admin'
        ]);
        break;

      case 'Agent':
        void this.router.navigate([
          '/agent'
        ]);
        break;

      case 'Underwriter':
        void this.router.navigate([
          '/underwriter'
        ]);
        break;

      case 'Claims Adjuster':
      case 'Claims Officer':
      case 'ClaimsOfficer':
        void this.router.navigate([
          '/claims-officer'
        ]);
        break;

      default:
        this.authSession.clear();

        void this.router.navigate([
          '/login'
        ]);
    }
  }
}
