export interface Driver {
  id: string;
  customerProfileId: string;

  licenceNumber: string;
  licenceState: string;

  licenceIssueDate: string;
  licenceExpiryDate: string;

  age: number;
  drivingExperienceYears: number;

  licenceValid: boolean;
  ready: boolean;

  readinessIssues: string[];

  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface UpsertDriverRequest {
  licenceNumber: string;
  licenceState: string;
  licenceIssueDate: string;
  licenceExpiryDate: string;
}
