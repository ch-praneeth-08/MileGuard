export interface StartQuoteRequest {
  vehicleId: string;
}

export interface StartQuoteResponse {
  resumedExistingDraft: boolean;
  quote: Quote;
}

export interface Quote {
  quoteId: string;
  customerProfileId: string;
  vehicleId: string;

  status: string;

  selectedPlanId: string | null;
  selectedPlanName: string | null;

  needsRecalculation: boolean;
  selectedAnnualPremium: number | null;

  createdAtUtc: string;
  updatedAtUtc: string | null;
  lastCalculatedAtUtc: string | null;
  finalizedAtUtc: string | null;
  validUntilUtc: string | null;

  underwritingApplicationId: string | null;

  planOptions: QuotePlanOption[];
  coverages: QuoteCoverage[];
  addOns: QuoteAddOn[];

  finalizedSnapshot: QuoteSnapshot | null;
}

export interface QuotePlanOption {
  planId: string;
  planCode: string;
  planName: string;

  coverages: string[];

  basePremium: number;
  riskAdjustedPremium: number;

  coverageOptionCharges: number;
  deductibleCharges: number;
  addOnCharges: number;

  finalAnnualPremium: number;

  isSelected: boolean;
}

export interface QuoteCoverage {
  coverageId: string;
  coverageName: string;

  coverageLimitOptionId: string;

  resolvedLimitAmount: number;
  coverageLimitCharge: number;

  deductibleOptionId: string | null;
  deductibleAmount: number | null;
  deductibleCharge: number;
}

export interface QuoteAddOn {
  addOnId: string;
  addOnName: string;
  annualPrice: number;
}

export interface QuoteSnapshot {
  finalizedAtUtc: string;
  validUntilUtc: string;

  planName: string;
  finalAnnualPremium: number;

  coverages: QuoteSnapshotCoverage[];
  addOns: QuoteSnapshotAddOn[];
}

export interface QuoteSnapshotCoverage {
  coverageName: string;
  resolvedLimitAmount: number;
  deductibleAmount: number | null;
}

export interface QuoteSnapshotAddOn {
  addOnName: string;
  annualPrice: number;
}

export interface SelectPlanRequest {
  planCode: number;
}

export interface CoverageSelectionRequest {
  coverageId: string;
  coverageLimitOptionId: string;
  deductibleOptionId: string | null;
}

export interface UpdateQuoteConfigurationRequest {
  coverages: CoverageSelectionRequest[];
  addOnIds: string[];
}

export interface FinalizeQuoteResponse {
  finalized: boolean;
  quoteUpdated: boolean;
  message?: string;
  quote: Quote;
}

export interface QuoteConfiguration {
  quoteId: string;

  planId: string;
  planCode: string;
  planName: string;

  coverages: QuoteCoverageConfiguration[];

  addOns: QuoteAddOnOption[];
}

export interface QuoteCoverageConfiguration {
  coverageId: string;

  coverageCode: string;
  coverageName: string;

  selectedCoverageLimitOptionId: string;

  selectedDeductibleOptionId: string | null;

  limitOptions: QuoteCoverageLimitOption[];

  deductibleOptions: QuoteDeductibleOption[];
}

export interface QuoteCoverageLimitOption {
  coverageLimitOptionId: string;

  tier: string;

  limitAmount: number | null;

  resolvedLimitAmount: number;

  annualCharge: number;

  isDefault: boolean;
  isSelected: boolean;
}

export interface QuoteDeductibleOption {
  deductibleOptionId: string;

  deductibleAmount: number;

  annualCharge: number;

  isDefault: boolean;
  isSelected: boolean;
}

export interface QuoteAddOnOption {
  addOnId: string;

  addOnCode: string;
  addOnName: string;

  annualPrice: number;

  isSelected: boolean;
}
