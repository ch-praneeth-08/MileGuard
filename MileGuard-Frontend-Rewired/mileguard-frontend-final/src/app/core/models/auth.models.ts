export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginStatus =
  | 'Authenticated'
  | 'Pending'
  | 'Rejected'
  | 'Inactive'
  | 'TwoFactorSetupRequired'
  | 'TwoFactorRequired';

export interface LoginResponse {
  status: LoginStatus;
  accessToken?: string;
  accessTokenExpiresAtUtc?: string;
  preAuthToken?: string;
  preAuthTokenExpiresAtUtc?: string;
  email?: string;
  role?: string;
  message?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
}

export interface TwoFactorEnrollmentResponse {
  sharedKey: string;
  authenticatorUri: string;
}
