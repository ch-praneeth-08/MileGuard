export type PolicyEffectiveStatus =
  | 'Issued'
  | 'Active'
  | 'Expired'
  | 'Cancelled';

export type InstallmentStatus =
  | 'Paid'
  | 'Due'
  | 'Overdue'
  | 'Upcoming'
  | 'NoLongerDue';

export interface PolicyListItem {
  policyId: string;
  policyNumber: string;
  vehicleId: string;
  vehicleDescription: string;
  planName: string;
  annualPremium: number;
  effectiveDate: string;
  expirationDate: string;
  effectiveStatus: PolicyEffectiveStatus;
  issuedAtUtc: string;
  cancellationEffectiveAtUtc: string | null;
}

export interface PolicyCoverage {
  coverageName: string;
  resolvedLimitAmount: number;
  deductibleAmount: number | null;
}

export interface PolicyAddOn {
  addOnName: string;
  annualPrice: number;
}

export interface PolicyDetail {
  policyId: string;
  policyNumber: string;
  underwritingApplicationId: string;
  customerProfileId: string;
  vehicleId: string;

  effectiveStatus: PolicyEffectiveStatus;

  issuedAtUtc: string;
  effectiveDate: string;
  expirationDate: string;

  cancellationEffectiveAtUtc:
    string | null;

  predecessorPolicyId:
    string | null;

  successorPolicyId:
    string | null;

  planName: string;
  annualPremium: number;
  paymentFrequency: string;

  vehicleVin: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleManufacturingYear: number;
  vehicleType: string;
  fuelType: string;
  vehicleValue: number;

  driverId: string;
  driverAge: number;
  drivingExperienceYears: number;
  licenceValid: boolean;

  hasDocument: boolean;

  coverages: PolicyCoverage[];
  addOns: PolicyAddOn[];
}

export interface PolicyInstallment {
  installmentId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  paidAtUtc: string | null;
  canPayNow: boolean;
}

export interface PolicyPayments {
  policyId: string;
  policyNumber: string;
  annualPremium: number;
  paymentFrequency: string;
  totalPaid: number;
  remainingAmount: number;
  installments: PolicyInstallment[];
}

export interface CancelPolicyResponse {
  policyId: string;
  policyNumber: string;
  effectiveStatus: string;
  cancellationEffectiveAtUtc: string;
  noLongerDueInstallmentCount: number;
}
