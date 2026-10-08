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
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  forkJoin,
  finalize
} from 'rxjs';

import {
  PolicyDetail,
  PolicyInstallment,
  PolicyPayments
} from '../../../../core/models/policy-billing/policy.models';
import {
  InstallmentPaymentResponse,
  PaymentMethod,
  PaymentTestScenario
} from '../../../../core/models/policy-billing/payment.models';
import {
  PolicyBillingApi
} from '../../services/policy-billing-api';

@Component({
  selector: 'app-customer-policy-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl: './customer-policy-detail.html',
  styleUrl: './customer-policy-detail.css'
})
export class CustomerPolicyDetail
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly policyBillingApi =
    inject(PolicyBillingApi);

  private policyId:
    string | null = null;

  readonly policy =
    signal<PolicyDetail | null>(null);

  readonly payments =
    signal<PolicyPayments | null>(null);

  readonly selectedInstallment =
    signal<PolicyInstallment | null>(null);

  readonly paymentResult =
    signal<InstallmentPaymentResponse | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly isPaying =
    signal(false);

  readonly isDownloading =
    signal(false);

  readonly isCancelling =
    signal(false);

  readonly paymentDialogOpen =
    signal(false);

  readonly cancellationDialogOpen =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly actionErrorMessage =
    signal<string | null>(null);

  readonly successMessage =
    signal<string | null>(null);

  readonly PaymentMethod =
    PaymentMethod;

  readonly paymentForm =
    this.formBuilder.nonNullable.group({
      method: [
        PaymentMethod.Card,
        Validators.required
      ],
      testScenario: [
        'SUCCESS' as PaymentTestScenario,
        Validators.required
      ]
    });

  readonly canCancel =
    computed(() => {
      const currentPolicy =
        this.policy();

      if (!currentPolicy) {
        return false;
      }

      return (
        currentPolicy.effectiveStatus === 'Issued' ||
        currentPolicy.effectiveStatus === 'Active'
      );
    });

  ngOnInit(): void {
    this.policyId =
      this.route.snapshot.paramMap.get(
        'policyId'
      );

    if (!this.policyId) {
      this.isLoading.set(false);
      this.errorMessage.set(
        'Policy ID is missing.'
      );
      return;
    }

    this.loadPolicy();
  }

  retry(): void {
    this.loadPolicy();
  }

  backToPolicies(): void {
    void this.router.navigate([
      '/customer/policies'
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

  goToUnderwriting(): void {
    void this.router.navigate([
      '/customer/underwriting'
    ]);
  }

  openPaymentDialog(
    installment: PolicyInstallment
  ): void {
    if (
      !installment.canPayNow ||
      this.isPaying()
    ) {
      return;
    }

    this.clearActionMessages();

    this.paymentResult.set(null);

    this.selectedInstallment.set(
      installment
    );

    this.paymentForm.reset({
      method: PaymentMethod.Card,
      testScenario: 'SUCCESS'
    });

    this.paymentDialogOpen.set(true);
  }

  closePaymentDialog(): void {
    if (this.isPaying()) {
      return;
    }

    this.paymentDialogOpen.set(false);
    this.selectedInstallment.set(null);
    this.paymentResult.set(null);
  }

  payInstallment(): void {
    const installment =
      this.selectedInstallment();

    if (
      !installment ||
      !installment.canPayNow ||
      this.paymentForm.invalid ||
      this.isPaying()
    ) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const values =
      this.paymentForm.getRawValue();

    this.clearActionMessages();
    this.paymentResult.set(null);
    this.isPaying.set(true);

    this.policyBillingApi
      .payInstallment(
        installment.installmentId,
        {
          method: values.method,
          testScenario:
            values.testScenario
        }
      )
      .pipe(
        finalize(() => {
          this.isPaying.set(false);
        })
      )
      .subscribe({
        next: result => {
          this.paymentResult.set(
            result
          );

          if (
            result.paymentResult
              .trim()
              .toLowerCase() ===
            'succeeded'
          ) {
            this.paymentDialogOpen.set(
              false
            );

            this.selectedInstallment.set(
              null
            );

            this.successMessage.set(
              `Installment ${result.installmentNumber} was paid successfully.`
            );

            this.loadPayments();
            return;
          }

          this.actionErrorMessage.set(
            result.failureMessage ??
            'The simulated installment payment was not successful.'
          );
        },

        error: error => {
          this.setActionError(
            error,
            'The installment payment could not be processed.'
          );
        }
      });
  }

  downloadDocument(): void {
    const currentPolicy =
      this.policy();

    if (
      !currentPolicy ||
      !currentPolicy.hasDocument ||
      this.isDownloading()
    ) {
      return;
    }

    this.clearActionMessages();
    this.isDownloading.set(true);

    this.policyBillingApi
      .getPolicyDocument(
        currentPolicy.policyId
      )
      .pipe(
        finalize(() => {
          this.isDownloading.set(false);
        })
      )
      .subscribe({
        next: file => {
          const objectUrl =
            URL.createObjectURL(file);

          const anchor =
            document.createElement('a');

          anchor.href =
            objectUrl;

          anchor.download =
            `${currentPolicy.policyNumber}.pdf`;

          document.body.appendChild(
            anchor
          );

          anchor.click();
          anchor.remove();

          URL.revokeObjectURL(
            objectUrl
          );

          this.successMessage.set(
            'Policy document downloaded successfully.'
          );
        },

        error: error => {
          this.setActionError(
            error,
            'The Policy document could not be downloaded.'
          );
        }
      });
  }

  openCancellationDialog(): void {
    if (
      !this.canCancel() ||
      this.isCancelling()
    ) {
      return;
    }

    this.clearActionMessages();
    this.cancellationDialogOpen.set(
      true
    );
  }

  closeCancellationDialog(): void {
    if (this.isCancelling()) {
      return;
    }

    this.cancellationDialogOpen.set(
      false
    );
  }

  confirmCancellation(): void {
    const currentPolicy =
      this.policy();

    if (
      !currentPolicy ||
      !this.canCancel() ||
      this.isCancelling()
    ) {
      return;
    }

    this.clearActionMessages();
    this.isCancelling.set(true);

    this.policyBillingApi
      .cancelPolicy(
        currentPolicy.policyId
      )
      .pipe(
        finalize(() => {
          this.isCancelling.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.cancellationDialogOpen.set(
            false
          );

          this.successMessage.set(
            `Policy ${response.policyNumber} was cancelled successfully.`
          );

          this.refreshAfterCancellation();
        },

        error: error => {
          this.cancellationDialogOpen.set(
            false
          );

          this.setActionError(
            error,
            'The Policy could not be cancelled.'
          );
        }
      });
  }

  statusClasses(): string {
    const status =
      this.policy()?.effectiveStatus;

    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700';

      case 'Issued':
        return 'bg-blue-50 text-blue-700';

      case 'Expired':
        return 'bg-zinc-100 text-zinc-600';

      case 'Cancelled':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  installmentClasses(
    status: string
  ): string {
    switch (
      status
        .trim()
        .toLowerCase()
    ) {
      case 'paid':
        return 'bg-green-50 text-green-700';

      case 'due':
        return 'bg-blue-50 text-blue-700';

      case 'overdue':
        return 'bg-red-50 text-red-700';

      case 'upcoming':
        return 'bg-zinc-100 text-zinc-600';

      case 'nolongerdue':
        return 'bg-zinc-100 text-zinc-500';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  private loadPolicy(): void {
    if (!this.policyId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.clearActionMessages();

    forkJoin({
      policy:
        this.policyBillingApi
          .getPolicy(
            this.policyId
          ),

      payments:
        this.policyBillingApi
          .getPolicyPayments(
            this.policyId
          )
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: result => {
          this.policy.set(
            result.policy
          );

          this.payments.set(
            result.payments
          );
        },

        error: error => {
          this.policy.set(null);
          this.payments.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to view this Policy.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'The Policy could not be found.'
            );
            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              error?.error?.message ??
              'Policy information is temporarily unavailable. Please try again.'
            );
            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'The Policy could not be loaded. Please try again.'
          );
        }
      });
  }

  private loadPayments(): void {
    const currentPolicy =
      this.policy();

    if (!currentPolicy) {
      return;
    }

    this.policyBillingApi
      .getPolicyPayments(
        currentPolicy.policyId
      )
      .subscribe({
        next: payments => {
          this.payments.set(
            payments
          );
        },

        error: error => {
          this.setActionError(
            error,
            'The latest payment information could not be loaded.'
          );
        }
      });
  }

  private refreshAfterCancellation():
    void {
    if (!this.policyId) {
      return;
    }

    forkJoin({
      policy:
        this.policyBillingApi
          .getPolicy(
            this.policyId
          ),

      payments:
        this.policyBillingApi
          .getPolicyPayments(
            this.policyId
          )
    })
      .subscribe({
        next: result => {
          this.policy.set(
            result.policy
          );

          this.payments.set(
            result.payments
          );
        },

        error: error => {
          this.setActionError(
            error,
            'The Policy was cancelled, but the latest Policy information could not be loaded. Reload the page to see its current state.'
          );
        }
      });
  }
openClaims(): void {
  void this.router.navigate([
    '/customer/claims'
  ]);
}
  private clearActionMessages():
    void {
    this.actionErrorMessage.set(
      null
    );

    this.successMessage.set(
      null
    );
  }

  private setActionError(
    error: any,
    fallback: string
  ): void {
    if (error?.status === 403) {
      this.actionErrorMessage.set(
        error?.error?.message ??
        'You are not permitted to perform this Policy action.'
      );
      return;
    }

    if (error?.status === 404) {
      this.actionErrorMessage.set(
        error?.error?.message ??
        'The requested Policy resource could not be found.'
      );
      return;
    }

    if (error?.status === 409) {
      this.actionErrorMessage.set(
        error?.error?.message ??
        'The Policy state has changed. Reload its latest information before trying again.'
      );
      return;
    }

    if (error?.status === 503) {
      this.actionErrorMessage.set(
        error?.error?.message ??
        'A required service is temporarily unavailable. Please try again.'
      );
      return;
    }

    this.actionErrorMessage.set(
      error?.error?.message ??
      fallback
    );
  }
}
