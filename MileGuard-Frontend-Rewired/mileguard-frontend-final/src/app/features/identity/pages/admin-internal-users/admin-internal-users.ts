import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import {
  DatePipe
} from '@angular/common';
import {
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';
import { RouterLink , RouterLinkActive
 } from '@angular/router';


import {
  InternalUser,
  PendingInternalRegistration
} from '../../../../core/models/admin-identity.models';
import { AuthApi } from '../../services/auth-api';
import { AdminIdentityApi } from '../../services/admin-identity-api';
import { AuthSession } from '../../../../core/auth/auth-session';

type AdminUsersTab =
  | 'pending'
  | 'users';

@Component({
  selector: 'app-admin-internal-users',
  imports: [
    DatePipe,
    RouterLink,
RouterLinkActive
  ],
  templateUrl: './admin-internal-users.html',
  styleUrl: './admin-internal-users.css'
})
export class AdminInternalUsers implements OnInit {
  private readonly adminApi =
    inject(AdminIdentityApi);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  private readonly router =
    inject(Router);

  readonly activeTab =
    signal<AdminUsersTab>('pending');

  readonly pendingRegistrations =
    signal<PendingInternalRegistration[]>([]);

  readonly users =
    signal<InternalUser[]>([]);

  readonly isLoading =
    signal(true);

  readonly isLoggingOut =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly currentUser =
    this.authSession.currentUser;

  ngOnInit(): void {
    this.loadPendingRegistrations();
  }

  selectPending(): void {
    if (this.activeTab() === 'pending') {
      return;
    }

    this.activeTab.set('pending');
    this.loadPendingRegistrations();
  }

  selectUsers(): void {
    if (this.activeTab() === 'users') {
      return;
    }

    this.activeTab.set('users');
    this.loadUsers();
  }
openClaimAssignments(): void {
  void this.router.navigate([
    '/admin/claims'
  ]);
}
  retry(): void {
    if (this.activeTab() === 'pending') {
      this.loadPendingRegistrations();
      return;
    }

    this.loadUsers();
  }

  reviewRegistration(
    registration: PendingInternalRegistration
  ): void {
    void this.router.navigate([
      '/admin/people/registrations',
      registration.id
    ]);
  }

  viewUser(
    user: InternalUser
  ): void {
    void this.router.navigate([
      '/admin/people/users',
      user.id
    ]);
  }

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);

    this.authApi
      .logout()
      .pipe(
        finalize(() => {
          this.isLoggingOut.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.authSession.clear();

          void this.router.navigate([
            '/login'
          ]);
        },

        error: () => {
          this.authSession.clear();

          void this.router.navigate([
            '/login'
          ]);
        }
      });
  }

  private loadPendingRegistrations(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.adminApi
      .getPendingRegistrations()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: registrations => {
          this.pendingRegistrations.set(
            registrations
          );
        },

        error: () => {
          this.errorMessage.set(
            'Pending registrations could not be loaded. Please try again.'
          );
        }
      });
  }

  private loadUsers(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.adminApi
      .getUsers()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: users => {
          this.users.set(users);
        },

        error: () => {
          this.errorMessage.set(
            'Internal users could not be loaded. Please try again.'
          );
        }
      });
  }
}
