export type AgentRenewalStatus =
  | 'Cancelled'
  | 'PolicyIssued'
  | 'QuoteInProgress'
  | 'Started'
  | 'NotRenewable'
  | 'TooEarly'
  | 'Eligible';

export interface AgentPolicyRenewal {
  policyId: string;
  policyNumber: string;
  renewalEligible: boolean;
  renewalWindowStarts: string;
  renewalEffectiveDate: string;
  renewalStatus: AgentRenewalStatus;
  renewalId: string | null;
  renewalQuoteId: string | null;
  renewedPolicyId: string | null;
}

export interface StartRenewalResponse {
  renewalId: string;
  sourcePolicyId: string;
  sourcePolicyNumber: string;
  customerProfileId: string;
  vehicleId: string;
  startedAtUtc: string;
  currentPolicyExpirationDate: string;
  renewalEffectiveDate: string;
  renewalQuoteId: string | null;
}
