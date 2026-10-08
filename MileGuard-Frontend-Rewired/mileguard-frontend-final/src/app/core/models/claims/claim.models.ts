export type ClaimStatus =
  | 'Submitted'
  | 'InReview'
  | 'Approved'
  | 'Rejected'
  | 'Settled'
  | 'Closed';

export type ClaimType =
  | 'Accident'
  | 'Theft'
  | 'Fire'
  | 'NaturalDisaster'
  | 'Vandalism'
  | 'Other';

export interface ClaimListItem {
  claimId: string;
  claimNumber: string;
  policyId: string;
  vehicleId: string;
  claimType: ClaimType;
  incidentAtUtc: string;
  estimatedLossAmount: number;
  status: ClaimStatus;
  submittedAtUtc: string;
  approvedAmount: number | null;
  closedAtUtc: string | null;
}

export interface ClaimDetail {
  claimId: string;
  claimNumber: string;
  policyId: string;
  vehicleId: string;
  claimType: ClaimType;
  incidentAtUtc: string;
  incidentLocation: string;
  incidentDescription: string;
  estimatedLossAmount: number;
  status: ClaimStatus;
  submittedAtUtc: string;
  reviewStartedAtUtc: string | null;
  decidedAtUtc: string | null;
  decisionReason: string | null;
  approvedAmount: number | null;
  settledAtUtc: string | null;
  closedAtUtc: string | null;
}
