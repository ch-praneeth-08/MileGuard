export type VehicleType =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8;

export type FuelType =
  | 1
  | 2
  | 3
  | 4
  | 5;

export type OwnershipType =
  | 1
  | 2;

export interface UpsertVehicleRequest {
  vin: string;
  registrationNumber: string;

  make: string;
  model: string;

  manufacturingYear: number;
  vehicleType: VehicleType;

  fuelType: FuelType;

  vehicleValue: number;

  currentOdometer: number;
  annualMileage: number;

  ownershipType: OwnershipType;

  purchaseDate: string;
}

export interface Vehicle {
  id: string;

  customerProfileId: string;

  vin: string;
  registrationNumber: string;

  make: string;
  model: string;

  manufacturingYear: number;

  vehicleType: string;
  fuelType: string;

  vehicleValue: number;

  currentOdometer: number;
  annualMileage: number;

  ownershipType: string;

  purchaseDate: string;

  vehicleAge: number;

  ready: boolean;

  readinessIssues: string[];

  hasImage: boolean;

  imageFileName: string | null;
  imageContentType: string | null;
  imageSizeBytes: number | null;
  imageUpdatedAtUtc: string | null;

  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface ApiMessageResponse {
  message: string;
}
