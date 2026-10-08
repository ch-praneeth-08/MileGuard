import {
  ClaimStatus,
  ClaimType
} from './claim.models';

export interface SubmitClaimRequest {
  policyId: string;
  claimType: ClaimType;
  incidentAtUtc: string;
  incidentLocation: string;
  incidentDescription: string;
  estimatedLossAmount: number;
}

export interface AgentClaimListItem {
  claimId: string;
  claimNumber: string;
  policyId: string;
  customerProfileId: string;
  vehicleId: string;
  claimType: ClaimType;
  incidentAtUtc: string;
  estimatedLossAmount: number;
  status: ClaimStatus;
  submittedAtUtc: string;
  approvedAmount: number | null;
  closedAtUtc: string | null;
}

export interface AgentClaimDetail {
  claimId: string;
  claimNumber: string;
  policyId: string;
  customerProfileId: string;
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
