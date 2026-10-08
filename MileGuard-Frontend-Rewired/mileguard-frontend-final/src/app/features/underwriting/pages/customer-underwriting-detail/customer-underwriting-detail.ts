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
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  AuthSession
} from '../../../../core/auth/auth-session';
import {
  PurchaseLifecycle
} from '../../../../core/models/policy-billing/purchase.models';
import {
  CustomerUnderwritingDetail
} from '../../../../core/models/underwriting.models';
import {
  AuthApi
} from '../../../identity/services/auth-api';
import {
  PolicyBillingApi
} from '../../../policy-billing/services/policy-billing-api';
import {
  UnderwritingApi
} from '../../services/underwriting-api';

@Component({
  selector:
    'app-customer-underwriting-detail',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './customer-underwriting-detail.html',
  styleUrl:
    './customer-underwriting-detail.css'
})
export class CustomerUnderwritingDetailPage
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly underwritingApi =
    inject(UnderwritingApi);

  private readonly policyBillingApi =
    inject(PolicyBillingApi);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  readonly currentUser =
    this.authSession.currentUser;

  /*
   * =====================================================
   * APPLICATION
   * =====================================================
   */

  readonly application =
    signal<CustomerUnderwritingDetail | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly isResponding =
    signal(false);

  readonly isLoggingOut =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly actionError =
    signal<string | null>(null);

  readonly successMessage =
    signal<string | null>(null);

  readonly showDeclineConfirmation =
    signal(false);

  /*
   * =====================================================
   * PURCHASE LIFECYCLE
   * =====================================================
   */

  readonly purchaseLifecycle =
    signal<PurchaseLifecycle | null>(
      null
    );

  readonly isLoadingPurchaseLifecycle =
    signal(false);

  /*
   * =====================================================
   * UNDERWRITING STATUS
   * =====================================================
   */

  readonly effectiveStatus =
    computed(() =>
      this.normalizedStatus(
        this.application()?.status ?? ''
      )
    );

  readonly customerOutcome =
    computed(() =>
      this.normalizedStatus(
        this.application()
          ?.customerOutcome ?? ''
      )
    );

  readonly isUnderReview =
    computed(() => {
      const status =
        this.effectiveStatus();

      return (
        status === 'unassigned' ||
        status === 'pendingreview' ||
        status === 'inreview'
      );
    });

  readonly isApproved =
    computed(
      () =>
        this.effectiveStatus() ===
        'approved'
    );

  readonly isRejected =
    computed(
      () =>
        this.effectiveStatus() ===
        'rejected'
    );

  readonly isAccepted =
    computed(
      () =>
        this.customerOutcome() ===
        'accepted'
    );

  readonly isDeclined =
    computed(
      () =>
        this.effectiveStatus() ===
          'declined' ||
        this.customerOutcome() ===
          'declined'
    );

  readonly isLapsed =
    computed(
      () =>
        this.effectiveStatus() ===
        'lapsed'
    );

  readonly hasCustomerResponded =
    computed(
      () =>
        this.isAccepted() ||
        this.isDeclined()
    );

  /*
   * =====================================================
   * PURCHASE STATE
   * =====================================================
   */

  readonly hasExistingPurchase =
    computed(
      () =>
        this.purchaseLifecycle()
          ?.hasPurchase === true
    );

  readonly hasIssuedPolicy =
    computed(
      () => {
        const lifecycle =
          this.purchaseLifecycle();

        return (
          lifecycle?.policyIssued === true &&
          !!lifecycle.policyId
        );
      }
    );

  /*
   * An approved application can continue to purchase
   * when no issued Policy exists.
   *
   * This allows an already-created Purchase to be
   * resumed after a failed or incomplete payment.
   */
  readonly canContinueToPurchase =
    computed(
      () =>
        this.isApproved() &&
        !this.isDeclined() &&
        !this.isLapsed() &&
        !this.hasIssuedPolicy() &&
        !this.isResponding() &&
        !this.isLoadingPurchaseLifecycle()
    );

  /*
   * Declining is only permitted before any Customer
   * response or Purchase exists.
   */
  readonly canDecline =
    computed(
      () =>
        this.isApproved() &&
        !this.hasCustomerResponded() &&
        !this.hasExistingPurchase() &&
        !this.hasIssuedPolicy() &&
        !this.isResponding() &&
        !this.isLoadingPurchaseLifecycle()
    );

  ngOnInit(): void {
    this.loadApplication();
  }

  /*
   * =====================================================
   * NAVIGATION
   * =====================================================
   */

  retry(): void {
    this.loadApplication();
  }

  returnToApplications(): void {
    void this.router.navigate([
      '/customer/underwriting'
    ]);
  }

  openPolicies(): void {
    void this.router.navigate([
      '/customer/policies'
    ]);
  }

  viewIssuedPolicy(): void {
    const policyId =
      this.purchaseLifecycle()
        ?.policyId;

    if (!policyId) {
      return;
    }

    void this.router.navigate([
      '/customer/policies',
      policyId
    ]);
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

  /*
   * =====================================================
   * PURCHASE
   * =====================================================
   */

  continueWithApprovedOffer():
    void {
    const currentApplication =
      this.application();

    if (
      !currentApplication ||
      !this.canContinueToPurchase()
    ) {
      return;
    }

    void this.router.navigate([
      '/customer/purchase',
      currentApplication.applicationId
    ]);
  }

  /*
   * =====================================================
   * DECLINE OFFER
   * =====================================================
   */

  openDeclineConfirmation():
    void {
    if (!this.canDecline()) {
      return;
    }

    this.actionError.set(null);
    this.successMessage.set(null);

    this.showDeclineConfirmation.set(
      true
    );
  }

  closeDeclineConfirmation():
    void {
    if (this.isResponding()) {
      return;
    }

    this.showDeclineConfirmation.set(
      false
    );
  }

  confirmDecline(): void {
    const currentApplication =
      this.application();

    if (
      !currentApplication ||
      !this.canDecline()
    ) {
      return;
    }

    this.isResponding.set(true);
    this.actionError.set(null);
    this.successMessage.set(null);

    this.underwritingApi
      .declineOffer(
        currentApplication.applicationId
      )
      .pipe(
        finalize(() => {
          this.isResponding.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.showDeclineConfirmation.set(
            false
          );

          this.successMessage.set(
            'The approved offer has been declined.'
          );

          this.application.update(
            existingApplication => {
              if (!existingApplication) {
                return null;
              }

              return {
                ...existingApplication,
                status:
                  response.status,
                customerOutcome:
                  response.outcome,
                customerRespondedAtUtc:
                  response.respondedAtUtc
              };
            }
          );
        },

        error: error => {
          this.showDeclineConfirmation.set(
            false
          );

          if (error?.status === 403) {
            this.actionError.set(
              'You are not permitted to respond to this Underwriting offer.'
            );
            return;
          }

          if (error?.status === 404) {
            this.actionError.set(
              error?.error?.message ??
              'The Underwriting application could not be found.'
            );
            return;
          }

          if (error?.status === 409) {
            this.actionError.set(
              error?.error?.message ??
              'This offer is no longer available to decline. Reload the application to view its current status.'
            );
            return;
          }

          if (error?.status === 503) {
            this.actionError.set(
              error?.error?.message ??
              'The Underwriting service is temporarily unavailable. Please try again.'
            );
            return;
          }

          this.actionError.set(
            error?.error?.message ??
            'The offer could not be declined. Please try again.'
          );
        }
      });
  }

  /*
   * =====================================================
   * DISPLAY HELPERS
   * =====================================================
   */

  pageTitle(): string {
    if (this.hasIssuedPolicy()) {
      return 'Policy Issued';
    }

    if (this.hasExistingPurchase()) {
      return 'Purchase In Progress';
    }

    if (this.isAccepted()) {
      return 'Accepted Offer';
    }

    if (this.isApproved()) {
      return 'Approved Offer';
    }

    return 'Underwriting Status';
  }

  customerStatusLabel(): string {
    if (this.isDeclined()) {
      return 'Declined';
    }

    if (this.hasIssuedPolicy()) {
      return 'Policy Issued';
    }

    if (this.hasExistingPurchase()) {
      return 'Purchase In Progress';
    }

    if (this.isAccepted()) {
      return 'Offer Accepted';
    }

    if (this.isUnderReview()) {
      return 'Under Review';
    }

    if (this.isApproved()) {
      return 'Approved';
    }

    if (this.isRejected()) {
      return 'Rejected';
    }

    if (this.isLapsed()) {
      return 'Lapsed';
    }

    return (
      this.application()?.status ??
      'Unknown'
    );
  }

  statusClasses(): string {
    if (this.isDeclined()) {
      return 'bg-zinc-100 text-zinc-600';
    }

    if (this.hasIssuedPolicy()) {
      return 'bg-green-50 text-green-700';
    }

    if (this.hasExistingPurchase()) {
      return 'bg-blue-50 text-blue-700';
    }

    if (this.isAccepted()) {
      return 'bg-blue-50 text-blue-700';
    }

    if (this.isUnderReview()) {
      return 'bg-blue-50 text-blue-700';
    }

    if (this.isApproved()) {
      return 'bg-green-50 text-green-700';
    }

    if (this.isRejected()) {
      return 'bg-red-50 text-red-700';
    }

    if (this.isLapsed()) {
      return 'bg-zinc-100 text-zinc-600';
    }

    return 'bg-zinc-100 text-zinc-600';
  }

  /*
   * =====================================================
   * AUTHENTICATION
   * =====================================================
   */

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

  /*
   * =====================================================
   * DATA LOADING
   * =====================================================
   */

  private loadApplication(): void {
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
    this.actionError.set(null);
    this.successMessage.set(null);

    this.purchaseLifecycle.set(null);

    this.underwritingApi
      .getCustomerApplication(
        applicationId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: currentApplication => {
          this.application.set(
            currentApplication
          );

          if (
            this.normalizedStatus(
              currentApplication.status
            ) === 'approved'
          ) {
            this.loadPurchaseLifecycle(
              currentApplication.applicationId
            );
          }
        },

        error: error => {
          this.application.set(null);
          this.purchaseLifecycle.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to view this Underwriting application.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'The Underwriting application could not be found.'
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
            'The Underwriting application could not be loaded. Please try again.'
          );
        }
      });
  }
openClaims(): void {
  void this.router.navigate([
    '/customer/claims'
  ]);
}
  private loadPurchaseLifecycle(
    applicationId: string
  ): void {
    this.isLoadingPurchaseLifecycle.set(
      true
    );

    this.policyBillingApi
      .getPurchaseLifecycle(
        applicationId
      )
      .pipe(
        finalize(() => {
          this.isLoadingPurchaseLifecycle.set(
            false
          );
        })
      )
      .subscribe({
        next: lifecycle => {
          this.purchaseLifecycle.set(
            lifecycle
          );
        },

        error: error => {
          this.purchaseLifecycle.set(null);

          if (error?.status === 403) {
            this.actionError.set(
              'You are not authorized to view the purchase state for this application.'
            );
            return;
          }

          if (error?.status === 404) {
            this.actionError.set(
              error?.error?.message ??
              'The purchase state could not be found.'
            );
            return;
          }

          if (error?.status === 503) {
            this.actionError.set(
              error?.error?.message ??
              'Policy Billing is temporarily unavailable. Please try again.'
            );
            return;
          }

          this.actionError.set(
            error?.error?.message ??
            'The current purchase state could not be loaded.'
          );
        }
      });
  }

  /*
   * =====================================================
   * NORMALIZATION
   * =====================================================
   */

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
