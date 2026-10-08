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
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import {
  forkJoin,
  finalize
} from 'rxjs';

import {
  AuthSession
} from '../../../../core/auth/auth-session';
import {
  AdminApplicationDetail,
  EligibleUnderwriterWithWorkload
} from '../../../../core/models/underwriting.models';
import {
  AuthApi
} from '../../../identity/services/auth-api';
import {
  UnderwritingApi
} from '../../services/underwriting-api';

@Component({
  selector:
    'app-admin-underwriting-review',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl:
    './admin-underwriting-review.html',
  styleUrl:
    './admin-underwriting-review.css'
})
export class AdminUnderwritingReview
  implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly underwritingApi =
    inject(UnderwritingApi);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  readonly currentUser =
    this.authSession.currentUser;

  readonly application =
    signal<AdminApplicationDetail | null>(
      null
    );

  readonly underwriters =
    signal<
      EligibleUnderwriterWithWorkload[]
    >([]);

  readonly selectedUnderwriterId =
    signal<string | null>(null);

  readonly isLoading =
    signal(true);

  readonly isAssigning =
    signal(false);

  readonly isLoggingOut =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly assignmentError =
    signal<string | null>(null);

  readonly assignmentConflict =
    signal(false);

  readonly showConfirmation =
    signal(false);

  readonly selectedUnderwriter =
    computed(() => {
      const selectedId =
        this.selectedUnderwriterId();

      if (!selectedId) {
        return null;
      }

      return this.underwriters()
        .find(
          underwriter =>
            underwriter.identityUserId ===
            selectedId
        ) ?? null;
    });

  readonly canAssign =
    computed(
      () =>
        !!this.application() &&
        !!this.selectedUnderwriter() &&
        !this.isAssigning() &&
        !this.assignmentConflict()
    );

  ngOnInit(): void {
    this.loadPage();
  }

  retry(): void {
    this.loadPage();
  }

  selectUnderwriter(
    underwriter:
      EligibleUnderwriterWithWorkload
  ): void {
    if (
      this.isAssigning() ||
      this.assignmentConflict()
    ) {
      return;
    }

    this.selectedUnderwriterId.set(
      underwriter.identityUserId
    );

    this.assignmentError.set(null);
  }

  openConfirmation(): void {
    if (!this.canAssign()) {
      return;
    }

    this.assignmentError.set(null);
    this.showConfirmation.set(true);
  }

  closeConfirmation(): void {
    if (this.isAssigning()) {
      return;
    }

    this.showConfirmation.set(false);
  }

  confirmAssignment(): void {
    const application =
      this.application();

    const underwriter =
      this.selectedUnderwriter();

    if (
      !application ||
      !underwriter ||
      this.isAssigning()
    ) {
      return;
    }

    this.isAssigning.set(true);
    this.assignmentError.set(null);

    this.underwritingApi
      .assignUnderwriter(
        application.applicationId,
        {
          underwriterIdentityUserId:
            underwriter.identityUserId
        }
      )
      .pipe(
        finalize(() => {
          this.isAssigning.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.showConfirmation.set(
            false
          );

          void this.router.navigate(
            ['/admin/underwriting'],
            {
              queryParams: {
                assigned: 'true'
              }
            }
          );
        },

        error: error => {
          this.showConfirmation.set(
            false
          );

          if (error?.status === 400) {
            this.assignmentError.set(
              error?.error?.message ??
              'The selected Underwriter is no longer eligible for assignment. Reload the available Underwriters and try again.'
            );
            return;
          }

          if (error?.status === 404) {
            this.assignmentError.set(
              error?.error?.message ??
              'This Underwriting application could not be found.'
            );
            return;
          }

          if (error?.status === 409) {
            this.assignmentConflict.set(
              true
            );

            this.assignmentError.set(
              error?.error?.message ??
              'This application has already been assigned. The existing assignment was not changed.'
            );
            return;
          }

          if (error?.status === 503) {
            this.assignmentError.set(
              error?.error?.message ??
              'Underwriter eligibility is temporarily unavailable. Please try again.'
            );
            return;
          }

          this.assignmentError.set(
            error?.error?.message ??
            'The Underwriter could not be assigned. Please try again.'
          );
        }
      });
  }

  returnToQueue(): void {
    void this.router.navigate([
      '/admin/underwriting'
    ]);
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

  private loadPage(): void {
    const applicationId =
      this.route.snapshot.paramMap.get(
        'applicationId'
      );

    if (!applicationId) {
      this.isLoading.set(false);
      this.errorMessage.set(
        'Underwriting application ID is missing.'
      );
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.assignmentError.set(null);
    this.assignmentConflict.set(false);
    this.selectedUnderwriterId.set(null);

    forkJoin({
      application:
        this.underwritingApi
          .getAdminApplication(
            applicationId
          ),

      underwriters:
        this.underwritingApi
          .getEligibleUnderwriters()
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: result => {
          this.application.set(
            result.application
          );

          this.underwriters.set(
            result.underwriters
          );
        },

        error: error => {
          this.application.set(null);
          this.underwriters.set([]);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to manage this Underwriting application.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'The Underwriting application was not found.'
            );
            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              error?.error?.message ??
              'Eligible Underwriters are temporarily unavailable. Please try again.'
            );
            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'The Underwriting assignment review could not be loaded. Please try again.'
          );
        }
      });
  }
}
