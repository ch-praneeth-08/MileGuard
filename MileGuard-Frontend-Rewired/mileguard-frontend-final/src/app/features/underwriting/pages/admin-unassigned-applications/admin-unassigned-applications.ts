import {
  DatePipe,
  DecimalPipe
} from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  AuthSession
} from '../../../../core/auth/auth-session';
import {
  UnassignedApplication
} from '../../../../core/models/underwriting.models';
import {
  AuthApi
} from '../../../identity/services/auth-api';
import {
  UnderwritingApi
} from '../../services/underwriting-api';

@Component({
  selector:
    'app-admin-unassigned-applications',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl:
    './admin-unassigned-applications.html',
  styleUrl:
    './admin-unassigned-applications.css'
})
export class AdminUnassignedApplications
  implements OnInit {
  private readonly underwritingApi =
    inject(UnderwritingApi);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  private readonly router =
    inject(Router);

  readonly currentUser =
    this.authSession.currentUser;

  readonly applications =
    signal<UnassignedApplication[]>([]);

  readonly isLoading =
    signal(true);

  readonly isLoggingOut =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.loadApplications();
  }

  retry(): void {
    this.loadApplications();
  }

  openApplication(
    application:
      UnassignedApplication
  ): void {
    void this.router.navigate([
      '/admin/underwriting',
      application.applicationId
    ]);
  }

  statusClasses(
    riskRating: string
  ): string {
    switch (
      riskRating
        .trim()
        .toLowerCase()
    ) {
      case 'low':
        return 'bg-green-50 text-green-700';

      case 'medium':
      case 'moderate':
        return 'bg-amber-50 text-amber-700';

      case 'high':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
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
          this.isLoggingOut.set(
            false
          );
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

  private loadApplications(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.underwritingApi
      .getUnassignedApplications()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: applications => {
          this.applications.set(
            applications
          );
        },

        error: error => {
          this.applications.set([]);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to manage Underwriting assignments.'
            );
            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              error?.error?.message ??
              'Underwriting information is temporarily unavailable. Please try again.'
            );
            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Unassigned Underwriting applications could not be loaded. Please try again.'
          );
        }
      });
  }
}
