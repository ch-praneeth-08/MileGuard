export interface UnassignedCustomer {
  customerProfileId: string;
  identityUserId: string;
  profileStatus: string;
  completedAtUtc: string;
}

export interface EligibleAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AssignAgentRequest {
  agentIdentityUserId: string;
}

export interface AgentAssignment {
  id: string;
  customerProfileId: string;
  agentIdentityUserId: string;
  assignedByIdentityUserId: string;
  assignedAtUtc: string;
}
export interface AssignmentReviewCustomer {
  customerProfileId: string;
  identityUserId: string;
  dateOfBirth: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  areaType: string | null;
  profileStatus: string;
  completedAtUtc: string | null;
  isAssigned: boolean;
}
