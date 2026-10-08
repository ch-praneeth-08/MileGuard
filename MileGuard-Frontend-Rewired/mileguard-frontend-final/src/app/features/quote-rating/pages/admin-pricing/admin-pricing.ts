import {
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

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
  AddOnPricing,
  CoverageOptionPricing,
  DeductiblePricing,
  PlanPricing,
  PricingConfiguration,
  RatingAdjustment
} from '../../../../core/models/pricing';

import {
  AuthApi
} from '../../../identity/services/auth-api';

import {
  Pricing
} from '../../services/pricing';

type PricingSection =
  | 'plans'
  | 'rating'
  | 'coverage'
  | 'addons';

@Component({
  selector: 'app-admin-pricing',
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl:
    './admin-pricing.html',
  styleUrl:
    './admin-pricing.css'
})
export class AdminPricing
  implements OnInit {

  private readonly pricingApi =
    inject(Pricing);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  private readonly router =
    inject(Router);

  readonly currentUser =
    this.authSession.currentUser;

  readonly activeSection =
    signal<PricingSection>(
      'plans'
    );

  readonly configuration =
    signal<PricingConfiguration | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly isSaving =
    signal(false);

  readonly isLoggingOut =
    signal(false);

  readonly savingItemId =
    signal<string | null>(null);

  readonly errorMessage =
    signal<string | null>(null);

  readonly successMessage =
    signal<string | null>(null);

  readonly confirmationOpen =
    signal(false);

  private pendingSave:
    (() => void) | null = null;

  ngOnInit(): void {
    this.loadConfiguration();
  }

  selectSection(
    section: PricingSection
  ): void {
    this.activeSection.set(
      section
    );

    this.clearMessages();
  }

  retry(): void {
    this.loadConfiguration();
  }

  requestPlanSave(
    plan: PlanPricing
  ): void {
    if (
      !this.validNonNegative(
        plan.basePremium
      )
    ) {
      this.errorMessage.set(
        'Base Premium must be zero or greater.'
      );

      return;
    }

    this.openConfirmation(
      () =>
        this.savePlan(
          plan
        )
    );
  }

  requestRatingSave(
    adjustment: RatingAdjustment
  ): void {
    if (
      !this.validNonNegative(
        adjustment.surchargePercent
      )
    ) {
      this.errorMessage.set(
        'Surcharge Percent must be zero or greater.'
      );

      return;
    }

    this.openConfirmation(
      () =>
        this.saveRatingAdjustment(
          adjustment
        )
    );
  }

  requestCoverageSave(
    option: CoverageOptionPricing
  ): void {
    if (
      !this.validNonNegative(
        option.annualCharge
      )
    ) {
      this.errorMessage.set(
        'Annual Charge must be zero or greater.'
      );

      return;
    }

    this.openConfirmation(
      () =>
        this.saveCoverageOption(
          option
        )
    );
  }

  requestDeductibleSave(
    option: DeductiblePricing
  ): void {
    if (
      !this.validNonNegative(
        option.annualCharge
      )
    ) {
      this.errorMessage.set(
        'Annual Charge must be zero or greater.'
      );

      return;
    }

    this.openConfirmation(
      () =>
        this.saveDeductible(
          option
        )
    );
  }

  requestAddOnSave(
    addOn: AddOnPricing
  ): void {
    if (
      !this.validNonNegative(
        addOn.annualPrice
      )
    ) {
      this.errorMessage.set(
        'Annual Price must be zero or greater.'
      );

      return;
    }

    this.openConfirmation(
      () =>
        this.saveAddOn(
          addOn
        )
    );
  }

  confirmSave(): void {
    if (
      !this.pendingSave ||
      this.isSaving()
    ) {
      return;
    }

    const operation =
      this.pendingSave;

    this.pendingSave = null;

    this.confirmationOpen.set(
      false
    );

    operation();
  }

  cancelConfirmation(): void {
    if (this.isSaving()) {
      return;
    }

    this.pendingSave = null;

    this.confirmationOpen.set(
      false
    );
  }

  limitLabel(
    option: CoverageOptionPricing
  ): string {
    if (
      option.isVehicleValueOption
    ) {
      return 'Up to Vehicle Value';
    }

    if (
      option.limitAmount === null
    ) {
      return 'Not available';
    }

    return this.formatCurrency(
      option.limitAmount
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

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(
      true
    );

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

  private loadConfiguration(): void {
    this.errorMessage.set(null);

    this.successMessage.set(null);

    this.isLoading.set(true);

    this.pricingApi
      .getConfiguration()
      .pipe(
        finalize(() => {
          this.isLoading.set(
            false
          );
        })
      )
      .subscribe({
        next: configuration => {
          this.configuration.set(
            configuration
          );
        },

        error: error => {
          this.configuration.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to manage pricing configuration.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Pricing configuration could not be loaded. Please try again.'
          );
        }
      });
  }

  private savePlan(
    plan: PlanPricing
  ): void {
    this.beginSave(
      plan.planId
    );

    this.pricingApi
      .updateBasePremium({
        planId:
          plan.planId,

        basePremium:
          plan.basePremium
      })
      .pipe(
        finalize(() => {
          this.endSave();
        })
      )
      .subscribe({
        next: response => {
          this.handleSaveSuccess(
            response.message
          );
        },

        error: error => {
          this.handleSaveError(
            error
          );
        }
      });
  }

  private saveRatingAdjustment(
    adjustment: RatingAdjustment
  ): void {
    this.beginSave(
      adjustment.ratingRuleId
    );

    this.pricingApi
      .updateRatingAdjustment({
        ratingRuleId:
          adjustment.ratingRuleId,

        surchargePercent:
          adjustment.surchargePercent
      })
      .pipe(
        finalize(() => {
          this.endSave();
        })
      )
      .subscribe({
        next: response => {
          this.handleSaveSuccess(
            response.message
          );
        },

        error: error => {
          this.handleSaveError(
            error
          );
        }
      });
  }

  private saveCoverageOption(
    option: CoverageOptionPricing
  ): void {
    this.beginSave(
      option.coverageLimitOptionId
    );

    this.pricingApi
      .updateCoverageOption({
        coverageLimitOptionId:
          option.coverageLimitOptionId,

        annualCharge:
          option.annualCharge
      })
      .pipe(
        finalize(() => {
          this.endSave();
        })
      )
      .subscribe({
        next: response => {
          this.handleSaveSuccess(
            response.message
          );
        },

        error: error => {
          this.handleSaveError(
            error
          );
        }
      });
  }

  private saveDeductible(
    option: DeductiblePricing
  ): void {
    this.beginSave(
      option.deductibleOptionId
    );

    this.pricingApi
      .updateDeductible({
        deductibleOptionId:
          option.deductibleOptionId,

        annualCharge:
          option.annualCharge
      })
      .pipe(
        finalize(() => {
          this.endSave();
        })
      )
      .subscribe({
        next: response => {
          this.handleSaveSuccess(
            response.message
          );
        },

        error: error => {
          this.handleSaveError(
            error
          );
        }
      });
  }

  private saveAddOn(
    addOn: AddOnPricing
  ): void {
    this.beginSave(
      addOn.addOnId
    );

    this.pricingApi
      .updateAddOn({
        addOnId:
          addOn.addOnId,

        annualPrice:
          addOn.annualPrice
      })
      .pipe(
        finalize(() => {
          this.endSave();
        })
      )
      .subscribe({
        next: response => {
          this.handleSaveSuccess(
            response.message
          );
        },

        error: error => {
          this.handleSaveError(
            error
          );
        }
      });
  }

  private openConfirmation(
    operation: () => void
  ): void {
    this.clearMessages();

    this.pendingSave =
      operation;

    this.confirmationOpen.set(
      true
    );
  }

  private beginSave(
    itemId: string
  ): void {
    this.clearMessages();

    this.isSaving.set(true);

    this.savingItemId.set(
      itemId
    );
  }

  private endSave(): void {
    this.isSaving.set(false);

    this.savingItemId.set(null);
  }

  private handleSaveSuccess(
  message: string
): void {
  this.successMessage.set(
    message ||
    'Pricing was updated successfully.'
  );

  this.refreshConfigurationAfterSave();
}

private refreshConfigurationAfterSave():
  void {
  this.pricingApi
    .getConfiguration()
    .subscribe({
      next: configuration => {
        this.configuration.set(
          configuration
        );
      },

      error: () => {
        this.errorMessage.set(
          'Pricing was updated, but the refreshed configuration could not be loaded. Reload the page to see the latest values.'
        );
      }
    });
}

  private handleSaveError(
    error: any
  ): void {
    if (error?.status === 404) {
      this.errorMessage.set(
        error?.error?.message ??
        'The pricing item could not be found.'
      );

      return;
    }

    if (error?.status === 400) {
      this.errorMessage.set(
        error?.error?.message ??
        'The pricing value is invalid.'
      );

      return;
    }

    if (error?.status === 403) {
      this.errorMessage.set(
        'You are not authorized to update pricing configuration.'
      );

      return;
    }

    this.errorMessage.set(
      error?.error?.message ??
      'Pricing could not be updated. Please try again.'
    );
  }

  private clearMessages(): void {
    this.errorMessage.set(null);

    this.successMessage.set(null);
  }

  private validNonNegative(
    value: number
  ): boolean {
    return (
      Number.isFinite(value) &&
      value >= 0
    );
  }
}
