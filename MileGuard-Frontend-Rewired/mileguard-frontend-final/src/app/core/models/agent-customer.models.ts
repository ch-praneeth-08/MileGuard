export interface AgentCustomerListItem {
  customerProfileId: string;
  identityUserId: string;

  profileStatus: string;

  profileCompletedAtUtc: string | null;

  assignedAtUtc: string;
}

export interface AgentCustomerWorkspace {
  customerProfileId: string;

  identityUserId: string;

  /*
   * Identity-owned read-only display data.
   */
  firstName: string | null;

  lastName: string | null;

  email: string | null;

  /*
   * CustomerVehicle-owned profile data.
   */
  dateOfBirth: string | null;

  phone: string | null;

  addressLine1: string | null;

  addressLine2: string | null;

  city: string | null;

  state: string | null;

  postalCode: string | null;

  areaType: string | null;

  profileStatus: string;

  profileCompletedAtUtc: string | null;

  assignedAtUtc: string;
}
