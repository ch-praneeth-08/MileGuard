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
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  CoverageSelectionRequest,
  Quote as QuoteModel,
  QuoteConfiguration,
  QuotePlanOption,
  UpdateQuoteConfigurationRequest
} from '../../../../core/models/quote.models';

import {
  Quote
} from '../../services/quote';

type QuoteStep =
  | 'compare'
  | 'configure'
  | 'review'
  | 'finalize';

@Component({
  selector: 'app-quote-workspace',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './quote-workspace.html',
  styleUrl:
    './quote-workspace.css'
})
export class QuoteWorkspace
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly quoteApi =
    inject(Quote);

  private customerProfileId:
    string | null = null;

  private quoteId:
    string | null = null;

  readonly quote =
    signal<QuoteModel | null>(null);

  readonly configuration =
    signal<QuoteConfiguration | null>(
      null
    );

  readonly currentStep =
    signal<QuoteStep>('compare');

  readonly selectedLimitIds =
    signal<Record<string, string>>({});

  readonly selectedDeductibleIds =
    signal<Record<string, string | null>>(
      {}
    );

  readonly selectedAddOnIds =
    signal<string[]>([]);

  readonly isLoading =
    signal(true);

  readonly isLoadingConfiguration =
    signal(false);

  readonly isSelectingPlan =
    signal(false);

  readonly isSavingConfiguration =
    signal(false);

  readonly isRecalculating =
    signal(false);

  readonly isFinalizing =
    signal(false);

    readonly isSubmitting =
  signal(false);

  readonly selectingPlanId =
    signal<string | null>(null);

  readonly errorMessage =
    signal<string | null>(null);

  readonly actionErrorMessage =
    signal<string | null>(null);

  readonly successMessage =
    signal<string | null>(null);

  readonly finalizeConfirmationOpen =
    signal(false);

    readonly submitConfirmationOpen =
  signal(false);
  ngOnInit(): void {
    this.customerProfileId =
      this.route.snapshot
        .paramMap
        .get('customerId');

    this.quoteId =
      this.route.snapshot
        .paramMap
        .get('quoteId');

    if (
      !this.customerProfileId ||
      !this.quoteId
    ) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    this.loadQuote();
  }

  retry(): void {
    this.loadQuote();
  }

  selectPlan(
    plan: QuotePlanOption
  ): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      this.isSelectingPlan()
    ) {
      return;
    }

    const planCode =
      this.planCodeValue(
        plan.planCode
      );

    if (planCode === null) {
      this.actionErrorMessage.set(
        'The selected Plan is invalid.'
      );

      return;
    }

    this.clearMessages();

    this.isSelectingPlan.set(true);

    this.selectingPlanId.set(
      plan.planId
    );

    this.quoteApi
      .selectPlan(
        currentQuote.quoteId,
        planCode
      )
      .pipe(
        finalize(() => {
          this.isSelectingPlan.set(
            false
          );

          this.selectingPlanId.set(
            null
          );
        })
      )
      .subscribe({
        next: updatedQuote => {
          this.quote.set(
            updatedQuote
          );

          this.configuration.set(null);

          this.successMessage.set(
            `${plan.planName} selected successfully.`
          );
        },

        error: error => {
          this.setOperationError(
            error,
            'The Plan could not be selected. Please try again.'
          );
        }
      });
  }

  continueToConfigure(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      !currentQuote.selectedPlanId
    ) {
      return;
    }

    this.currentStep.set(
      'configure'
    );

    this.loadConfiguration();
  }

  chooseLimit(
  coverageId: string,
  optionId: string
): void {
  this.selectedLimitIds.update(
    current => ({
      ...current,
      [coverageId]: optionId
    })
  );

  this.successMessage.set(null);
}

chooseDeductible(
  coverageId: string,
  optionId: string
): void {
  this.selectedDeductibleIds.update(
    current => ({
      ...current,
      [coverageId]: optionId
    })
  );

  this.successMessage.set(null);
}


  toggleAddOn(
    addOnId: string
  ): void {
    this.selectedAddOnIds.update(
      current => {
        if (
          current.includes(
            addOnId
          )
        ) {
          return current.filter(
            id =>
              id !== addOnId
          );
        }

        return [
          ...current,
          addOnId
        ];
      }
    );

    this.successMessage.set(null);
  }

  isLimitSelected(
    coverageId: string,
    optionId: string
  ): boolean {
    return (
      this.selectedLimitIds()[
        coverageId
      ] === optionId
    );
  }

  isDeductibleSelected(
    coverageId: string,
    optionId: string
  ): boolean {
    return (
      this.selectedDeductibleIds()[
        coverageId
      ] === optionId
    );
  }

  isAddOnSelected(
    addOnId: string
  ): boolean {
    return this.selectedAddOnIds()
      .includes(
        addOnId
      );
  }

  saveConfiguration(): void {
    const currentQuote =
      this.quote();

    const currentConfiguration =
      this.configuration();

    if (
      !currentQuote ||
      !currentConfiguration ||
      this.isSavingConfiguration()
    ) {
      return;
    }

    const coverages:
      CoverageSelectionRequest[] = [];

    for (
      const coverage of
        currentConfiguration.coverages
    ) {
      const limitId =
        this.selectedLimitIds()[
          coverage.coverageId
        ];

      if (!limitId) {
        this.actionErrorMessage.set(
          `Select a coverage limit for ${coverage.coverageName}.`
        );

        return;
      }

      let deductibleId:
        string | null = null;

      if (
        coverage.deductibleOptions
          .length > 0
      ) {
        deductibleId =
          this.selectedDeductibleIds()[
            coverage.coverageId
          ] ?? null;

        if (!deductibleId) {
          this.actionErrorMessage.set(
            `Select a deductible for ${coverage.coverageName}.`
          );

          return;
        }
      }

      coverages.push({
        coverageId:
          coverage.coverageId,

        coverageLimitOptionId:
          limitId,

        deductibleOptionId:
          deductibleId
      });
    }

    const request:
      UpdateQuoteConfigurationRequest = {
        coverages,
        addOnIds:
          this.selectedAddOnIds()
    };

    this.clearMessages();

    this.isSavingConfiguration.set(
      true
    );

    this.quoteApi
      .updateConfiguration(
        currentQuote.quoteId,
        request
      )
      .pipe(
        finalize(() => {
          this.isSavingConfiguration.set(
            false
          );
        })
      )
      .subscribe({
        next: updatedQuote => {
          this.quote.set(
            updatedQuote
          );

          this.successMessage.set(
            'Configuration saved. Recalculate the Quote to confirm the updated premium.'
          );

          this.loadConfiguration();
        },

        error: error => {
          this.setOperationError(
            error,
            'The Quote configuration could not be saved.'
          );
        }
      });
  }

  recalculate(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      this.isRecalculating()
    ) {
      return;
    }

    this.clearMessages();

    this.isRecalculating.set(
      true
    );

    this.quoteApi
      .recalculate(
        currentQuote.quoteId
      )
      .pipe(
        finalize(() => {
          this.isRecalculating.set(
            false
          );
        })
      )
      .subscribe({
        next: updatedQuote => {
          this.quote.set(
            updatedQuote
          );

          this.successMessage.set(
            'Quote recalculated successfully using the latest risk, Claims, and pricing information.'
          );

          this.loadConfiguration();
        },

        error: error => {
          this.setOperationError(
            error,
            'The Quote could not be recalculated. Your existing Draft remains unchanged.'
          );
        }
      });
  }

  continueToReview(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      currentQuote.needsRecalculation
    ) {
      return;
    }

    this.clearMessages();

    this.currentStep.set(
      'review'
    );
  }

  continueToFinalize(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      currentQuote.needsRecalculation
    ) {
      return;
    }

    this.clearMessages();

    this.currentStep.set(
      'finalize'
    );
  }

  openFinalizeConfirmation(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      currentQuote.needsRecalculation
    ) {
      return;
    }

    this.finalizeConfirmationOpen.set(
      true
    );
  }

  closeFinalizeConfirmation(): void {
    if (this.isFinalizing()) {
      return;
    }

    this.finalizeConfirmationOpen.set(
      false
    );
  }

  finalizeQuote(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      currentQuote.needsRecalculation ||
      this.isFinalizing()
    ) {
      return;
    }

    this.clearMessages();

    this.isFinalizing.set(
      true
    );

    this.quoteApi
      .finalizeQuote(
        currentQuote.quoteId
      )
      .pipe(
        finalize(() => {
          this.isFinalizing.set(
            false
          );
        })
      )
      .subscribe({
        next: response => {
          this.finalizeConfirmationOpen.set(
            false
          );

          this.quote.set(
            response.quote
          );

          if (response.quoteUpdated) {
            this.currentStep.set(
              'review'
            );

            this.configuration.set(null);

            this.successMessage.set(
              response.message ??
              'Quote updated using the latest information. Review the updated Quote before finalizing again.'
            );

            return;
          }

          if (response.finalized) {
            this.configuration.set(null);

            this.successMessage.set(
              'Quote finalized successfully.'
            );

            return;
          }

          this.actionErrorMessage.set(
            response.message ??
            'The Quote could not be finalized.'
          );
        },

        error: error => {
          this.setOperationError(
            error,
            'The Quote could not be finalized.'
          );
        }
      });
  }
openSubmitConfirmation(): void {
  const currentQuote =
    this.quote();

  if (
    !currentQuote ||
    currentQuote.status !== 'Finalized' ||
    this.isSubmitting()
  ) {
    return;
  }

  this.clearMessages();

  this.submitConfirmationOpen.set(
    true
  );
}

closeSubmitConfirmation(): void {
  if (this.isSubmitting()) {
    return;
  }

  this.submitConfirmationOpen.set(
    false
  );
}

submitToUnderwriting(): void {
  const currentQuote =
    this.quote();

  if (
    !currentQuote ||
    currentQuote.status !== 'Finalized' ||
    this.isSubmitting()
  ) {
    return;
  }

  this.clearMessages();

  this.isSubmitting.set(
    true
  );

  this.quoteApi
    .submitQuote(
      currentQuote.quoteId
    )
    .pipe(
      finalize(() => {
        this.isSubmitting.set(
          false
        );
      })
    )
    .subscribe({
      next: updatedQuote => {
        this.submitConfirmationOpen.set(
          false
        );

        this.quote.set(
          updatedQuote
        );

        this.successMessage.set(
          'Quote submitted to Underwriting successfully.'
        );
      },

      error: error => {
        this.setOperationError(
          error,
          'The Quote could not be submitted to Underwriting.'
        );
      }
    });
}
  backStep(): void {
    switch (this.currentStep()) {
      case 'configure':
        this.currentStep.set(
          'compare'
        );
        break;

      case 'review':
        this.currentStep.set(
          'configure'
        );

        if (!this.configuration()) {
          this.loadConfiguration();
        }

        break;

      case 'finalize':
        this.currentStep.set(
          'review'
        );
        break;

      default:
        this.backToQuotes();
        break;
    }

    this.clearMessages();
  }

  goToCompare(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft'
    ) {
      return;
    }

    this.clearMessages();

    this.currentStep.set(
      'compare'
    );
  }

  goToConfigure(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      !currentQuote.selectedPlanId
    ) {
      return;
    }

    this.clearMessages();

    this.currentStep.set(
      'configure'
    );

    if (!this.configuration()) {
      this.loadConfiguration();
    }
  }

  goToReview(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      currentQuote.status !== 'Draft' ||
      currentQuote.needsRecalculation
    ) {
      return;
    }

    this.clearMessages();

    this.currentStep.set(
      'review'
    );
  }

  backToQuotes(): void {
    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'quotes'
    ]);
  }

  selectedPlan():
    QuotePlanOption | null {
    return (
      this.quote()
        ?.planOptions
        .find(
          plan =>
            plan.isSelected
        ) ??
      null
    );
  }

  isPlanBeingSelected(
    plan: QuotePlanOption
  ): boolean {
    return (
      this.isSelectingPlan() &&
      this.selectingPlanId() ===
        plan.planId
    );
  }

  selectedLimitLabel(
    coverageId: string
  ): string {
    const configuration =
      this.configuration();

    if (!configuration) {
      return 'Not selected';
    }

    const coverage =
      configuration.coverages
        .find(
          item =>
            item.coverageId ===
            coverageId
        );

    if (!coverage) {
      return 'Not selected';
    }

    const selectedId =
      this.selectedLimitIds()[
        coverageId
      ];

    const option =
      coverage.limitOptions
        .find(
          item =>
            item.coverageLimitOptionId ===
            selectedId
        );

    if (!option) {
      return 'Not selected';
    }

    return this.formatCurrency(
      option.resolvedLimitAmount
    );
  }

  formatCurrency(
    value: number
  ): string {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }
    ).format(value);
  }

  private loadQuote(): void {
    if (!this.quoteId) {
      return;
    }

    this.errorMessage.set(null);

    this.actionErrorMessage.set(null);

    this.successMessage.set(null);

    this.isLoading.set(true);

    this.quoteApi
      .getQuote(
        this.quoteId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: currentQuote => {
          if (
            this.customerProfileId &&
            currentQuote.customerProfileId !==
              this.customerProfileId
          ) {
            this.quote.set(null);

            this.errorMessage.set(
              'This Quote does not belong to the current Customer workspace.'
            );

            return;
          }

          this.quote.set(
            currentQuote
          );

          if (
            currentQuote.status !==
            'Draft'
          ) {
            this.currentStep.set(
              'finalize'
            );

            return;
          }

          if (
            currentQuote.selectedPlanId
          ) {
            this.currentStep.set(
              'compare'
            );
          }
        },

        error: error => {
          this.quote.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This Quote is not available to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              'The Quote could not be found.'
            );

            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              'Customer information is temporarily unavailable. Please try again.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'The Quote could not be loaded. Please try again.'
          );
        }
      });
  }

  private loadConfiguration(): void {
    const currentQuote =
      this.quote();

    if (
      !currentQuote ||
      !currentQuote.selectedPlanId ||
      this.isLoadingConfiguration()
    ) {
      return;
    }

    this.actionErrorMessage.set(null);

    this.isLoadingConfiguration.set(
      true
    );

    this.quoteApi
      .getConfiguration(
        currentQuote.quoteId
      )
      .pipe(
        finalize(() => {
          this.isLoadingConfiguration.set(
            false
          );
        })
      )
      .subscribe({
        next: configuration => {
          this.configuration.set(
            configuration
          );

          this.initializeConfigurationSelections(
            configuration
          );
        },

        error: error => {
          this.configuration.set(null);

          this.setOperationError(
            error,
            'The Quote configuration could not be loaded.'
          );
        }
      });
  }

  private initializeConfigurationSelections(
    configuration: QuoteConfiguration
  ): void {
    const limits:
      Record<string, string> = {};

    const deductibles:
      Record<string, string | null> = {};

    for (
      const coverage of
        configuration.coverages
    ) {
      limits[
        coverage.coverageId
      ] =
        coverage
          .selectedCoverageLimitOptionId;

      deductibles[
        coverage.coverageId
      ] =
        coverage
          .selectedDeductibleOptionId;
    }

    this.selectedLimitIds.set(
      limits
    );

    this.selectedDeductibleIds.set(
      deductibles
    );

    this.selectedAddOnIds.set(
      configuration.addOns
        .filter(
          addOn =>
            addOn.isSelected
        )
        .map(
          addOn =>
            addOn.addOnId
        )
    );
  }

  private clearMessages(): void {
    this.actionErrorMessage.set(
      null
    );

    this.successMessage.set(
      null
    );
  }

  private setOperationError(
    error: any,
    fallback: string
  ): void {
    if (error?.status === 403) {
      this.actionErrorMessage.set(
        'This Customer is not assigned to your Agent account.'
      );

      return;
    }

    if (error?.status === 404) {
      this.actionErrorMessage.set(
        error?.error?.message ??
        'The Quote could not be found.'
      );

      return;
    }

    if (error?.status === 409) {
      this.actionErrorMessage.set(
        error?.error?.message ??
        fallback
      );

      return;
    }

    if (error?.status === 503) {
      this.actionErrorMessage.set(
        error?.error?.message ??
        'A required service is temporarily unavailable. Your Draft remains safe.'
      );

      return;
    }

    this.actionErrorMessage.set(
      error?.error?.message ??
      fallback
    );
  }

  private planCodeValue(
    planCode: string
  ): number | null {
    switch (
      planCode
        .trim()
        .toLowerCase()
    ) {
      case 'basic':
        return 1;

      case 'standard':
        return 2;

      case 'premium':
        return 3;

      default:
        return null;
    }
  }
}
