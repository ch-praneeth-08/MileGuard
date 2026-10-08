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
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  AuthSession
} from '../../../../core/auth/auth-session';
import {
  CustomerUnderwritingListItem
} from '../../../../core/models/underwriting.models';
import {
  AuthApi
} from '../../../identity/services/auth-api';
import {
  UnderwritingApi
} from '../../services/underwriting-api';

@Component({
  selector: 'app-customer-underwriting',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './customer-underwriting.html',
  styleUrl:
    './customer-underwriting.css'
})
export class CustomerUnderwriting
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
      CustomerUnderwritingListItem[]
    >([]);

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
      CustomerUnderwritingListItem
  ): void {
    void this.router.navigate([
      '/customer/underwriting',
      application.applicationId
    ]);
  }

  statusLabel(
    status: string
  ): string {
    switch (
      this.normalizedStatus(status)
    ) {
      case 'unassigned':
      case 'pendingreview':
      case 'inreview':
        return 'Under Review';

      case 'approved':
        return 'Approved';

      case 'rejected':
        return 'Rejected';

      case 'declined':
        return 'Declined';

      case 'lapsed':
        return 'Lapsed';

      default:
        return status;
    }
  }

  statusClasses(
    status: string
  ): string {
    switch (
      this.normalizedStatus(status)
    ) {
      case 'unassigned':
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

  statusMessage(
    application:
      CustomerUnderwritingListItem
  ): string {
    switch (
      this.normalizedStatus(
        application.status
      )
    ) {
      case 'unassigned':
      case 'pendingreview':
      case 'inreview':
        return 'Your application is being reviewed. No action is required right now.';

      case 'approved':
        return 'Your application was approved. Open the offer to review the terms and available actions.';

      case 'rejected':
        return 'The application was not approved. Open the application to review the decision.';

      case 'declined':
        return 'You declined this approved offer.';

      case 'lapsed':
        return 'The approved offer is no longer available.';

      default:
        return 'Open the application to view the latest Underwriting status.';
    }
  }

  actionLabel(
    status: string
  ): string {
    switch (
      this.normalizedStatus(status)
    ) {
      case 'approved':
        return 'Review Offer';

      default:
        return 'View Application';
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
      .getCustomerApplications()
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
              'You are not authorized to view these Underwriting applications.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'Your Customer profile could not be found.'
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
            'Your Underwriting applications could not be loaded. Please try again.'
          );
        }
      });
  }
goToVehicles(): void {
  void this.router.navigate([
    '/customer/vehicles'
  ]);
}

goToProfile(): void {
  void this.router.navigate([
    '/customer/profile'
  ]);
}
openPolicies(): void {
  void this.router.navigate([
    '/customer/policies'
  ]);
}
openClaims(): void {
  void this.router.navigate([
    '/customer/claims'
  ]);
}
  private normalizedStatus(
    status: string
  ): string {
    return status
      .trim()
      .toLowerCase()
      .replace(
        /[\s_-]+/g,
        ''
      );
  }
}
