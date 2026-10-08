import { Directive, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthApi } from '../features/identity/services/auth-api';
import { AuthSession } from '../core/auth/auth-session';

@Directive()
export abstract class RoleShellBase {
  protected readonly router = inject(Router);
  protected readonly authApi = inject(AuthApi);
  protected readonly authSession = inject(AuthSession);

  readonly currentUser = this.authSession.currentUser;
  readonly sidebarCollapsed = signal(false);
  readonly isLoggingOut = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }

  goHome(route: readonly string[]): void {
    void this.router.navigate(route);
  }

  openAccount(): void {
    void this.router.navigate(['/account/profile']);
  }

  logout(): void {
    if (this.isLoggingOut()) return;
    this.isLoggingOut.set(true);
    this.authApi.logout().pipe(finalize(() => this.isLoggingOut.set(false))).subscribe({
      next: () => {
        this.authSession.clear();
        void this.router.navigate(['/login']);
      },
      error: () => {
        this.authSession.clear();
        void this.router.navigate(['/login']);
      }
    });
  }
}
