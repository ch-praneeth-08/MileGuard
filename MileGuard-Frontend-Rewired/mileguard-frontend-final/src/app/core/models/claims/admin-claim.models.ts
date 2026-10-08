import {
  ClaimStatus,
  ClaimType
} from './claim.models';

export interface AdminClaimListItem {
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
  assignedClaimsOfficerIdentityUserId: string | null;
  assignedAtUtc: string | null;
}

export interface AdminClaimDetail {
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
  assignedClaimsOfficerIdentityUserId: string | null;
  assignedByAdminIdentityUserId: string | null;
  assignedAtUtc: string | null;
  reviewStartedAtUtc: string | null;
  reviewedByIdentityUserId: string | null;
  decidedAtUtc: string | null;
  decisionReason: string | null;
  approvedAmount: number | null;
  settledAtUtc: string | null;
  closedAtUtc: string | null;
}

export interface EligibleClaimsOfficer {
  identityUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  actionableClaimCount: number;
}

export interface AssignClaimsOfficerRequest {
  claimsOfficerIdentityUserId: string;
}
