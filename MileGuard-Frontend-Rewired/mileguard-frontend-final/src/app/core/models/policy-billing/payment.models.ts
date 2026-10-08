export enum PaymentMethod {
  Card = 1,
  Upi = 2
}

export type PaymentTestScenario =
  | 'SUCCESS'
  | 'FAIL';

export interface MakePaymentRequest {
  method: PaymentMethod;
  testScenario: PaymentTestScenario;
}

export interface FirstPaymentResponse {
  purchaseId: string;
  paymentReference: string;
  paymentResult: string;
  amount: number;
  paymentMethod: string;
  attemptedAtUtc: string;
  failureCode: string | null;
  failureMessage: string | null;
  policyId: string | null;
  policyNumber: string | null;
}

export interface InstallmentPaymentResponse {
  installmentId: string;
  installmentNumber: number;
  paymentReference: string;
  paymentResult: string;
  amount: number;
  paymentMethod: string;
  attemptedAtUtc: string;
  paidAtUtc: string | null;
  failureCode: string | null;
  failureMessage: string | null;
}
