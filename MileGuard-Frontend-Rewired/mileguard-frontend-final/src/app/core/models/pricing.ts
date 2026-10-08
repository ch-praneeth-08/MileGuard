export interface PricingConfiguration {
  plans: PlanPricing[];
  ratingAdjustments: RatingAdjustment[];
  coverageOptions: CoverageOptionPricing[];
  deductibles: DeductiblePricing[];
  addOns: AddOnPricing[];
}

export interface PlanPricing {
  planId: string;
  planCode: string;
  planName: string;
  basePremium: number;
  mandatoryCoverages: string[];
}

export interface RatingAdjustment {
  ratingRuleId: string;
  factor: string;
  bandCode: string;
  bandLabel: string;
  surchargePercent: number;
}

export interface CoverageOptionPricing {
  coverageLimitOptionId: string;
  coverageId: string;
  coverageName: string;
  tier: string;
  limitAmount: number | null;
  isVehicleValueOption: boolean;
  isDefault: boolean;
  annualCharge: number;
}

export interface DeductiblePricing {
  deductibleOptionId: string;
  coverageId: string;
  coverageName: string;
  deductibleAmount: number;
  isDefault: boolean;
  annualCharge: number;
}

export interface AddOnPricing {
  addOnId: string;
  addOnCode: string;
  addOnName: string;
  annualPrice: number;
  eligiblePlans: string[];
}

export interface UpdateBasePremiumRequest {
  planId: string;
  basePremium: number;
}

export interface UpdateRatingAdjustmentRequest {
  ratingRuleId: string;
  surchargePercent: number;
}

export interface UpdateCoverageOptionPriceRequest {
  coverageLimitOptionId: string;
  annualCharge: number;
}

export interface UpdateDeductiblePriceRequest {
  deductibleOptionId: string;
  annualCharge: number;
}

export interface UpdateAddOnPriceRequest {
  addOnId: string;
  annualPrice: number;
}

export interface PricingMessageResponse {
  message: string;
}
