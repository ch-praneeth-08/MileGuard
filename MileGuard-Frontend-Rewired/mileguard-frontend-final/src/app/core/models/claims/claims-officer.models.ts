import {
  ClaimStatus,
  ClaimType
} from './claim.models';

export interface ClaimsOfficerClaimListItem {
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
  assignedAtUtc: string | null;
  reviewStartedAtUtc: string | null;
}

export interface ClaimsOfficerClaimDetail {
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
  assignedAtUtc: string | null;
  reviewStartedAtUtc: string | null;
  decidedAtUtc: string | null;
  decisionReason: string | null;
  approvedAmount: number | null;
  settledAtUtc: string | null;
  closedAtUtc: string | null;
}

export interface ApproveClaimRequest {
  decisionReason: string;
}

export interface RejectClaimRequest {
  rejectionReason: string;
}

export interface SettleClaimRequest {
  approvedAmount: number;
}
