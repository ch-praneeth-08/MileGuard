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
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  AcceptPurchaseResponse,
  ConfigurePurchaseResponse,
  PaymentFrequency
} from '../../../../core/models/policy-billing/purchase.models';

import {
  FirstPaymentResponse,
  PaymentMethod,
  PaymentTestScenario
} from '../../../../core/models/policy-billing/payment.models';

import {
  PolicyBillingApi
} from '../../services/policy-billing-api';

type PurchaseStep =
  | 'configure'
  | 'review'
  | 'payment'
  | 'issued';

@Component({
  selector: 'app-customer-purchase',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl:
    './customer-purchase.html',
  styleUrl:
    './customer-purchase.css'
})
export class CustomerPurchase
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly policyBillingApi =
    inject(PolicyBillingApi);

  private applicationId:
    string | null = null;

  readonly currentStep =
    signal<PurchaseStep>(
      'configure'
    );

  readonly configuration =
    signal<ConfigurePurchaseResponse | null>(
      null
    );

  readonly purchase =
    signal<AcceptPurchaseResponse | null>(
      null
    );

  readonly payment =
    signal<FirstPaymentResponse | null>(
      null
    );

  readonly isConfiguring =
    signal(false);

  readonly isAccepting =
    signal(false);

  readonly isPaying =
    signal(false);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  readonly successMessage =
    signal<string | null>(
      null
    );

  readonly PaymentFrequency =
    PaymentFrequency;

  readonly PaymentMethod =
    PaymentMethod;

  readonly configureForm =
    this.formBuilder.nonNullable.group({
      effectiveDate: [
        '',
        Validators.required
      ],

      paymentFrequency: [
        PaymentFrequency.Annual,
        Validators.required
      ]
    });

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

  ngOnInit(): void {
    this.applicationId =
      this.route.snapshot
        .paramMap
        .get('applicationId');

    if (!this.applicationId) {
      this.errorMessage.set(
        'Underwriting application ID is missing.'
      );

      return;
    }

    this.configureForm.patchValue({
      effectiveDate:
        this.todayDateValue()
    });
  }

  previewConfiguration(): void {
    if (
      !this.applicationId ||
      this.configureForm.invalid ||
      this.isConfiguring()
    ) {
      this.configureForm
        .markAllAsTouched();

      return;
    }

    const values =
      this.configureForm
        .getRawValue();

    this.clearMessages();

    this.isConfiguring.set(
      true
    );

    this.policyBillingApi
      .configurePurchase(
        this.applicationId,
        {
          effectiveDate:
            values.effectiveDate,

          paymentFrequency:
            values.paymentFrequency
        }
      )
      .pipe(
        finalize(() => {
          this.isConfiguring.set(
            false
          );
        })
      )
      .subscribe({
        next: configuration => {
          this.configuration.set(
            configuration
          );

          this.successMessage.set(
            'Purchase configuration validated successfully.'
          );
        },

        error: error => {
          this.configuration.set(
            null
          );

          this.setError(
            error,
            'Purchase configuration could not be validated.'
          );
        }
      });
  }

  continueToReview(): void {
    if (
      !this.configuration()
    ) {
      return;
    }

    this.clearMessages();

    this.currentStep.set(
      'review'
    );
  }

  backToConfigure(): void {
    if (this.isAccepting()) {
      return;
    }

    this.clearMessages();

    this.currentStep.set(
      'configure'
    );

    /*
     * Returning to Configure invalidates the current
     * preview as the Customer may change the inputs.
     */
    this.configuration.set(
      null
    );
  }

  acceptAndContinue(): void {
    if (
      !this.applicationId ||
      !this.configuration() ||
      this.isAccepting()
    ) {
      return;
    }

    const values =
      this.configureForm
        .getRawValue();

    this.clearMessages();

    this.isAccepting.set(
      true
    );

    this.policyBillingApi
      .acceptPurchase(
        this.applicationId,
        {
          effectiveDate:
            values.effectiveDate,

          paymentFrequency:
            values.paymentFrequency
        }
      )
      .pipe(
        finalize(() => {
          this.isAccepting.set(
            false
          );
        })
      )
      .subscribe({
        next: purchase => {
          this.purchase.set(
            purchase
          );

          if (
            purchase.issuedPolicyId
          ) {
            void this.router.navigate([
              '/customer/policies',
              purchase.issuedPolicyId
            ]);

            return;
          }

          this.currentStep.set(
            'payment'
          );

          this.successMessage.set(
            'Purchase accepted. Complete the first payment to issue the Policy.'
          );
        },

        error: error => {
          this.setError(
            error,
            'The purchase could not be accepted.'
          );
        }
      });
  }

  makePayment(): void {
    const purchase =
      this.purchase();

    if (
      !purchase ||
      this.paymentForm.invalid ||
      this.isPaying()
    ) {
      this.paymentForm
        .markAllAsTouched();

      return;
    }

    const values =
      this.paymentForm
        .getRawValue();

    this.clearMessages();

    this.payment.set(
      null
    );

    this.isPaying.set(
      true
    );

    this.policyBillingApi
      .makeFirstPayment(
        purchase.purchaseId,
        {
          method:
            values.method,

          testScenario:
            values.testScenario
        }
      )
      .pipe(
        finalize(() => {
          this.isPaying.set(
            false
          );
        })
      )
      .subscribe({
        next: payment => {
          this.payment.set(
            payment
          );

          if (
            payment.paymentResult
              .trim()
              .toLowerCase() ===
            'succeeded' &&
            payment.policyId
          ) {
            this.currentStep.set(
              'issued'
            );

            this.successMessage.set(
              'Payment succeeded and your Policy has been issued.'
            );

            return;
          }

          this.errorMessage.set(
            payment.failureMessage ??
            'The simulated payment was not successful. No Policy was issued.'
          );
        },

        error: error => {
          this.setError(
            error,
            'The payment could not be processed. No Policy was issued.'
          );
        }
      });
  }

  retryPayment(): void {
    this.clearMessages();

    this.payment.set(
      null
    );
  }

  viewPolicy(): void {
    const policyId =
      this.payment()?.policyId;

    if (!policyId) {
      return;
    }

    void this.router.navigate([
      '/customer/policies',
      policyId
    ]);
  }

  backToUnderwriting(): void {
    if (
      this.isConfiguring() ||
      this.isAccepting() ||
      this.isPaying()
    ) {
      return;
    }

    if (this.applicationId) {
      void this.router.navigate([
        '/customer/underwriting',
        this.applicationId
      ]);

      return;
    }

    void this.router.navigate([
      '/customer/underwriting'
    ]);
  }

  frequencyLabel(
    frequency: number
  ): string {
    switch (frequency) {
      case PaymentFrequency.Annual:
        return 'Annual';

      case PaymentFrequency.SemiAnnual:
        return 'Semi-Annual';

      case PaymentFrequency.Quarterly:
        return 'Quarterly';

      case PaymentFrequency.Monthly:
        return 'Monthly';

      default:
        return 'Unknown';
    }
  }

  private todayDateValue():
    string {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        '0'
      );

    return `${year}-${month}-${day}`;
  }

  private clearMessages(): void {
    this.errorMessage.set(
      null
    );

    this.successMessage.set(
      null
    );
  }

  private setError(
    error: any,
    fallback: string
  ): void {
    if (error?.status === 403) {
      this.errorMessage.set(
        error?.error?.message ??
        'This approved offer does not belong to your Customer account.'
      );

      return;
    }

    if (error?.status === 404) {
      this.errorMessage.set(
        error?.error?.message ??
        'The approved Underwriting offer could not be found.'
      );

      return;
    }

    if (error?.status === 409) {
      this.errorMessage.set(
        error?.error?.message ??
        'The purchase state has changed. Return to the approved offer and reload its current status.'
      );

      return;
    }

    if (error?.status === 503) {
      this.errorMessage.set(
        error?.error?.message ??
        'A required service is temporarily unavailable. Please try again.'
      );

      return;
    }

    this.errorMessage.set(
      error?.error?.message ??
      fallback
    );
  }
}
