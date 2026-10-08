export enum PaymentFrequency {
  Annual = 1,
  SemiAnnual = 2,
  Quarterly = 3,
  Monthly = 4
}

export interface ConfigurePurchaseRequest {
  effectiveDate: string;
  paymentFrequency: PaymentFrequency;
}

export interface AcceptPurchaseRequest {
  effectiveDate: string;
  paymentFrequency: PaymentFrequency;
}

export interface ScheduleInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
}

export interface PaymentSchedulePreview {
  annualPremium: number;
  paymentFrequency: string;
  installmentCount: number;
  amountDueNow: number;
  installments: ScheduleInstallment[];
}

export interface ConfigurePurchaseResponse {
  underwritingApplicationId: string;
  customerProfileId: string;
  vehicleId: string;
  planName: string;
  annualPremium: number;
  effectiveDate: string;
  expirationDate: string;
  offerValidUntilUtc: string;
  paymentSchedule: PaymentSchedulePreview;
}
export interface PurchaseLifecycle {
  underwritingApplicationId: string;
  hasPurchase: boolean;
  purchaseId: string | null;
  policyIssued: boolean;
  policyId: string | null;
}
export interface AcceptPurchaseResponse {
  purchaseId: string;
  underwritingApplicationId: string;
  customerProfileId: string;
  vehicleId: string;
  planName: string;
  annualPremium: number;
  effectiveDate: string;
  expirationDate: string;
  paymentFrequency: string;
  acceptedAtUtc: string;
  amountDueNow: number;
  installmentCount: number;
  issuedPolicyId: string | null;
}
