export type AreaType =
  | 1
  | 2;

export interface CreateCustomerProfileRequest {
  dateOfBirth: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  areaType: AreaType;
}

export interface UpdateCustomerProfileRequest {
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
}

export interface CustomerProfile {
  id: string;
  identityUserId: string;
  dateOfBirth: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  areaType: string | null;
  profileStatus: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  completedAtUtc: string | null;
}
