export interface UnassignedApplication {
  applicationId: string;
  originatingQuoteId: string;
  customerProfileId: string;
  vehicleId: string;
  planName: string;
  annualPremium: number;
  overallRiskRating: string;
  createdAtUtc: string;
}

export interface AdminDriverSnapshot {
  driverId: string;
  driverAge: number;
  drivingExperienceYears: number;
  licenceIssueDate: string;
  licenceExpiryDate: string;
  licenceValid: boolean;
}

export interface AdminVehicleSnapshot {
  vin: string;
  make: string;
  model: string;
  manufacturingYear: number;
  vehicleAge: number;
  vehicleType: string;
  fuelType: string;
  vehicleValue: number;
  currentOdometer: number;
  annualMileage: number;
  ownershipType: string;
}

export interface AdminQuoteSnapshot {
  planId: string;
  planName: string;
  annualPremium: number;
  overallRiskRating: string;
  quoteFinalizedAtUtc: string;
  quoteValidUntilUtc: string;
}

export interface AdminApplicationDetail {
  applicationId: string;
  originatingQuoteId: string;
  customerProfileId: string;
  vehicleId: string;
  status: string;
  createdAtUtc: string;
  driver: AdminDriverSnapshot;
  vehicle: AdminVehicleSnapshot;
  quote: AdminQuoteSnapshot;
}

export interface EligibleUnderwriterWithWorkload {
  identityUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  actionableApplicationCount: number;
}

export interface AssignUnderwriterRequest {
  underwriterIdentityUserId: string;
}

export interface UnderwriterApplicationListItem {
  applicationId: string;
  originatingQuoteId: string;
  customerProfileId: string;
  vehicleId: string;
  status: string;
  planName: string;
  annualPremium: number;
  overallRiskRating: string;
  assignedAtUtc: string | null;
  reviewStartedAtUtc: string | null;
}

export interface UnderwriterDriverReview {
  driverId: string;
  customerDateOfBirth: string;
  geography: string;
  driverAge: number;
  drivingExperienceYears: number;
  licenceIssueDate: string;
  licenceExpiryDate: string;
  licenceValid: boolean;
  qualifyingClaimsCount: number;
}

export interface UnderwriterVehicleReview {
  vin: string;
  make: string;
  model: string;
  manufacturingYear: number;
  vehicleAge: number;
  vehicleType: string;
  fuelType: string;
  vehicleValue: number;
  currentOdometer: number;
  annualMileage: number;
  ownershipType: string;
  purchaseDate: string;
}

export interface UnderwriterCoverage {
  coverageName: string;
  resolvedLimitAmount: number;
  deductibleAmount: number | null;
}

export interface UnderwriterAddOn {
  addOnName: string;
  annualPrice: number;
}

export interface UnderwriterQuoteReview {
  planId: string;
  planName: string;
  annualPremium: number;
  overallRiskRating: string;
  quoteFinalizedAtUtc: string;
  quoteValidUntilUtc: string;
  coverages: UnderwriterCoverage[];
  addOns: UnderwriterAddOn[];
}

export interface UnderwriterReviewSection {
  sectionId: string;
  sectionType: string;
  reviewed: boolean;
  reviewedAtUtc: string | null;
  notes: string | null;
}

export interface UnderwriterReview {
  applicationId: string;
  originatingQuoteId: string;
  customerProfileId: string;
  vehicleId: string;
  status: string;
  createdAtUtc: string;
  assignedAtUtc: string | null;
  reviewStartedAtUtc: string | null;
  driver: UnderwriterDriverReview;
  vehicle: UnderwriterVehicleReview;
  quote: UnderwriterQuoteReview;
  reviewSections: UnderwriterReviewSection[];
}

export interface UpdateReviewSectionRequest {
  reviewed: boolean;
  notes: string | null;
}

export interface MakeUnderwritingDecisionRequest {
  decision: string;
  rejectionReason: string | null;
}

export interface UnderwritingDecision {
  applicationId: string;
  status: string;
  decision: string;
  decidedAtUtc: string;
  rejectionReason: string | null;
  offerValidUntilUtc: string | null;
}

export interface CustomerUnderwritingListItem {
  applicationId: string;
  originatingQuoteId: string;
  vehicleId: string;
  status: string;
  planName: string;
  annualPremium: number;
  createdAtUtc: string;
  decidedAtUtc: string | null;
  offerValidUntilUtc: string | null;
}

export interface CustomerCoverage {
  coverageName: string;
  resolvedLimitAmount: number;
  deductibleAmount: number | null;
}

export interface CustomerAddOn {
  addOnName: string;
  annualPrice: number;
}

export interface CustomerUnderwritingDetail {
  applicationId: string;
  originatingQuoteId: string;
  vehicleId: string;
  status: string;
  planName: string;
  annualPremium: number;
  quoteFinalizedAtUtc: string;
  quoteValidUntilUtc: string;
  decidedAtUtc: string | null;
  offerValidUntilUtc: string | null;
  rejectionReason: string | null;
  customerOutcome: string | null;
  customerRespondedAtUtc: string | null;
  coverages: CustomerCoverage[];
  addOns: CustomerAddOn[];
}

export interface CustomerOfferResponse {
  applicationId: string;
  status: string;
  outcome: string;
  respondedAtUtc: string;
}
