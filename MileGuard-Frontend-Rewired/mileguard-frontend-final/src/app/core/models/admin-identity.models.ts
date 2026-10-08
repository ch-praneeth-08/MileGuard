export interface PendingInternalRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registeredAtUtc: string;
}

export interface InternalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  twoFactorStatus: string;
}

export interface InternalRegistrationDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  registeredAtUtc: string;
}

export interface ApproveInternalRegistrationRequest {
  role: string;
}

export interface AdminActionResponse {
  message: string;
}

export interface InternalUserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  twoFactorStatus: string;
  createdAtUtc: string;
  approvedAtUtc: string | null;
  deactivatedAtUtc: string | null;
}
