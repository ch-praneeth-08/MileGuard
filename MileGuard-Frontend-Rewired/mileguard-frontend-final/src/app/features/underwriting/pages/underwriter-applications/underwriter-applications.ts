import {
  DatePipe,
  DecimalPipe
} from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  AuthSession
} from '../../../../core/auth/auth-session';
import {
  UnderwriterApplicationListItem
} from '../../../../core/models/underwriting.models';
import {
  AuthApi
} from '../../../identity/services/auth-api';
import {
  UnderwritingApi
} from '../../services/underwriting-api';

type ApplicationTab =
  | 'pending'
  | 'in-review'
  | 'completed';

@Component({
  selector:
    'app-underwriter-applications',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './underwriter-applications.html',
  styleUrl:
    './underwriter-applications.css'
})
export class UnderwriterApplications
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
    signal<
      UnderwriterApplicationListItem[]
    >([]);

  readonly activeTab =
    signal<ApplicationTab>(
      'pending'
    );

  readonly isLoading =
    signal(true);

  readonly isLoggingOut =
    signal(false);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  readonly pendingApplications =
    computed(() =>
      this.applications().filter(
        application =>
          this.normalizedStatus(
            application.status
          ) === 'pendingreview'
      )
    );

  readonly inReviewApplications =
    computed(() =>
      this.applications().filter(
        application =>
          this.normalizedStatus(
            application.status
          ) === 'inreview'
      )
    );

  readonly completedApplications =
    computed(() =>
      this.applications().filter(
        application => {
          const status =
            this.normalizedStatus(
              application.status
            );

          return (
            status === 'approved' ||
            status === 'rejected' ||
            status === 'declined' ||
            status === 'lapsed'
          );
        }
      )
    );

  readonly visibleApplications =
    computed(() => {
      switch (this.activeTab()) {
        case 'pending':
          return this.pendingApplications();

        case 'in-review':
          return this.inReviewApplications();

        case 'completed':
          return this.completedApplications();
      }
    });

  ngOnInit(): void {
    this.loadApplications();
  }

  setActiveTab(
    tab: ApplicationTab
  ): void {
    this.activeTab.set(tab);
  }

  retry(): void {
    this.loadApplications();
  }

  openApplication(
    application:
      UnderwriterApplicationListItem
  ): void {
    void this.router.navigate([
      '/underwriter/applications',
      application.applicationId,
      'review'
    ]);
  }

  actionLabel(
    application:
      UnderwriterApplicationListItem
  ): string {
    const status =
      this.normalizedStatus(
        application.status
      );

    if (
      status === 'approved' ||
      status === 'rejected' ||
      status === 'declined' ||
      status === 'lapsed'
    ) {
      return 'View';
    }

    return 'Review';
  }

  statusClasses(
    status: string
  ): string {
    switch (
      this.normalizedStatus(status)
    ) {
      case 'pendingreview':
        return 'bg-amber-50 text-amber-700';

      case 'inreview':
        return 'bg-blue-50 text-blue-700';

      case 'approved':
        return 'bg-green-50 text-green-700';

      case 'rejected':
        return 'bg-red-50 text-red-700';

      case 'declined':
      case 'lapsed':
        return 'bg-zinc-100 text-zinc-600';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  riskClasses(
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

  emptyTitle(): string {
    switch (this.activeTab()) {
      case 'pending':
        return 'No applications waiting for review';

      case 'in-review':
        return 'No applications currently in review';

      case 'completed':
        return 'No completed applications';
    }
  }

  emptyMessage(): string {
    switch (this.activeTab()) {
      case 'pending':
        return 'New applications assigned to you will appear here.';

      case 'in-review':
        return 'Applications move here when you open them for review.';

      case 'completed':
        return 'Approved and rejected applications will remain available here as read-only history.';
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

  private loadApplications(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.underwritingApi
      .getMyUnderwritingApplications()
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
              'You are not authorized to access the Underwriter application queue.'
            );
            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              error?.error?.message ??
              'Underwriting applications are temporarily unavailable. Please try again.'
            );
            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Your Underwriting applications could not be loaded. Please try again.'
          );
        }
      });
  }

  private normalizedStatus(
    status: string
  ): string {
    return status
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
  }
}
