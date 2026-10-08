import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';
import {
  DatePipe,
  DecimalPipe
} from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  FuelType,
  OwnershipType,
  UpsertVehicleRequest,
  Vehicle,
  VehicleType
} from '../../../../core/models/vehicle.models';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-agent-vehicle-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl:
    './agent-vehicle-detail.html',
  styleUrl:
    './agent-vehicle-detail.css'
})
export class AgentVehicleDetail
  implements OnInit, OnDestroy {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private customerProfileId:
    string | null = null;

  private vehicleId:
    string | null = null;

  readonly vehicle =
    signal<Vehicle | null>(
      null
    );

  readonly imageUrl =
    signal<string | null>(
      null
    );

  readonly replacementPreviewUrl =
    signal<string | null>(
      null
    );

  readonly selectedReplacementImage =
    signal<File | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly isLoadingImage =
    signal(false);

  readonly isEditing =
    signal(false);

  readonly isSaving =
    signal(false);

  readonly isUploadingImage =
    signal(false);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  readonly successMessage =
    signal<string | null>(
      null
    );

  readonly imageErrorMessage =
    signal<string | null>(
      null
    );

  readonly editForm =
    this.formBuilder.nonNullable.group({
      vin: [
        '',
        [
          Validators.required,
          Validators.minLength(17),
          Validators.maxLength(17)
        ]
      ],

      registrationNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      make: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      model: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      manufacturingYear: [
        null as number | null,
        [
          Validators.required,
          Validators.min(1900)
        ]
      ],

      vehicleType: [
        '',
        Validators.required
      ],

      fuelType: [
        '',
        Validators.required
      ],

      vehicleValue: [
        null as number | null,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      currentOdometer: [
        null as number | null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      annualMileage: [
        null as number | null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      ownershipType: [
        '',
        Validators.required
      ],

      purchaseDate: [
        '',
        Validators.required
      ]
    });

  ngOnInit(): void {
    this.customerProfileId =
      this.route.snapshot
        .paramMap
        .get('customerId');

    this.vehicleId =
      this.route.snapshot
        .paramMap
        .get('vehicleId');

    if (
      !this.customerProfileId ||
      !this.vehicleId
    ) {
      this.backToGarage();
      return;
    }

    this.loadVehicle();
  }

  ngOnDestroy(): void {
    this.revokeCurrentImage();

    this.revokeReplacementPreview();
  }

  backToGarage(): void {
    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId
    ]);
  }

  retry(): void {
    this.loadVehicle();
  }

  startEdit(): void {
    const vehicle =
      this.vehicle();

    if (!vehicle) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.editForm.setValue({
      vin:
        vehicle.vin,

      registrationNumber:
        vehicle.registrationNumber,

      make:
        vehicle.make,

      model:
        vehicle.model,

      manufacturingYear:
        vehicle.manufacturingYear,

      vehicleType:
        this.vehicleTypeValue(
          vehicle.vehicleType
        ),

      fuelType:
        this.fuelTypeValue(
          vehicle.fuelType
        ),

      vehicleValue:
        vehicle.vehicleValue,

      currentOdometer:
        vehicle.currentOdometer,

      annualMileage:
        vehicle.annualMileage,

      ownershipType:
        this.ownershipTypeValue(
          vehicle.ownershipType
        ),

      purchaseDate:
        vehicle.purchaseDate
    });

    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);

    this.errorMessage.set(null);

    this.editForm.reset();
  }

  saveVehicle(): void {
    const vehicle =
      this.vehicle();

    if (
      !vehicle ||
      this.editForm.invalid ||
      this.isSaving()
    ) {
      this.editForm.markAllAsTouched();
      return;
    }

    const values =
      this.editForm.getRawValue();

    const request:
      UpsertVehicleRequest = {
        vin:
          values.vin
            .trim()
            .toUpperCase(),

        registrationNumber:
          values.registrationNumber
            .trim()
            .toUpperCase(),

        make:
          values.make.trim(),

        model:
          values.model.trim(),

        manufacturingYear:
          values.manufacturingYear!,

        vehicleType:
          Number(
            values.vehicleType
          ) as VehicleType,

        fuelType:
          Number(
            values.fuelType
          ) as FuelType,

        vehicleValue:
          values.vehicleValue!,

        currentOdometer:
          values.currentOdometer!,

        annualMileage:
          values.annualMileage!,

        ownershipType:
          Number(
            values.ownershipType
          ) as OwnershipType,

        purchaseDate:
          values.purchaseDate
      };

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSaving.set(true);

    this.customerVehicleApi
      .updateAgentVehicle(
        vehicle.id,
        request
      )
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: updatedVehicle => {
          this.vehicle.set(
            updatedVehicle
          );

          this.isEditing.set(false);

          this.editForm.reset();

          this.successMessage.set(
            'Vehicle updated successfully.'
          );
        },

        error: error => {
          if (error?.status === 409) {
            this.errorMessage.set(
              error?.error?.message ??
              'VIN or Registration Number is already in use.'
            );

            return;
          }

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to modify this Vehicle.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              'Vehicle was not found.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Vehicle could not be updated. Please try again.'
          );
        }
      });
  }

  onReplacementImageSelected(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    this.imageErrorMessage.set(null);

    const allowedTypes = [
      'image/jpeg',
      'image/png'
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      input.value = '';

      this.imageErrorMessage.set(
        'Vehicle image must be JPG, JPEG, or PNG.'
      );

      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (
      file.size >
      maximumSize
    ) {
      input.value = '';

      this.imageErrorMessage.set(
        'Vehicle image cannot exceed 5 MB.'
      );

      return;
    }

    this.revokeReplacementPreview();

    this.selectedReplacementImage
      .set(file);

    this.replacementPreviewUrl
      .set(
        URL.createObjectURL(file)
      );
  }

  cancelImageReplacement(): void {
    this.selectedReplacementImage
      .set(null);

    this.imageErrorMessage
      .set(null);

    this.revokeReplacementPreview();
  }

  uploadReplacementImage(): void {
    const vehicle =
      this.vehicle();

    const image =
      this.selectedReplacementImage();

    if (
      !vehicle ||
      !image ||
      this.isUploadingImage()
    ) {
      return;
    }

    this.imageErrorMessage.set(null);
    this.successMessage.set(null);
    this.isUploadingImage.set(true);

    this.customerVehicleApi
      .uploadVehicleImage(
        vehicle.id,
        image
      )
      .pipe(
        finalize(() => {
          this.isUploadingImage
            .set(false);
        })
      )
      .subscribe({
        next: () => {
          this.cancelImageReplacement();

          this.successMessage.set(
            'Vehicle image updated successfully.'
          );

          /*
           * Reload Vehicle metadata and protected image.
           */
          this.loadVehicle();
        },

        error: error => {
          if (error?.status === 403) {
            this.imageErrorMessage.set(
              'You are not authorized to modify this Vehicle image.'
            );

            return;
          }

          if (error?.status === 404) {
            this.imageErrorMessage.set(
              'Vehicle was not found.'
            );

            return;
          }

          this.imageErrorMessage.set(
            error?.error?.message ??
            'Vehicle image could not be uploaded.'
          );
        }
      });
  }

  private loadVehicle(): void {
    if (!this.vehicleId) {
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.customerVehicleApi
      .getVehicle(
        this.vehicleId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: vehicle => {
          /*
           * Route/customer consistency check.
           *
           * The backend still performs the actual
           * authorization. This simply prevents a stale
           * or malformed frontend URL from displaying a
           * Vehicle belonging to another Customer route.
           */
          if (
            this.customerProfileId &&
            vehicle.customerProfileId !==
              this.customerProfileId
          ) {
            this.vehicle.set(null);

            this.errorMessage.set(
              'Vehicle does not belong to this Customer workspace.'
            );

            return;
          }

          this.vehicle.set(vehicle);

          if (vehicle.hasImage) {
            this.loadImage(
              vehicle.id
            );
          } else {
            this.revokeCurrentImage();

            this.imageUrl.set(null);
          }
        },

        error: error => {
          this.vehicle.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This Vehicle is not available to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              'Vehicle was not found.'
            );

            return;
          }

          this.errorMessage.set(
            'Vehicle information could not be loaded. Please try again.'
          );
        }
      });
  }

  private loadImage(
    vehicleId: string
  ): void {
    this.isLoadingImage.set(true);

    this.imageErrorMessage.set(null);

    this.customerVehicleApi
      .getVehicleImage(
        vehicleId
      )
      .pipe(
        finalize(() => {
          this.isLoadingImage.set(
            false
          );
        })
      )
      .subscribe({
        next: imageBlob => {
          this.revokeCurrentImage();

          this.imageUrl.set(
            URL.createObjectURL(
              imageBlob
            )
          );
        },

        error: error => {
          this.revokeCurrentImage();

          this.imageUrl.set(null);

          /*
           * Missing image is a normal optional state.
           */
          if (error?.status === 404) {
            return;
          }

          if (error?.status === 403) {
            this.imageErrorMessage.set(
              'Vehicle image is not available to your Agent account.'
            );

            return;
          }

          this.imageErrorMessage.set(
            'Vehicle image could not be loaded.'
          );
        }
      });
  }

  private vehicleTypeValue(
    value: string
  ): string {
    const values:
      Record<string, string> = {
        Sedan: '1',
        Hatchback: '2',
        Suv: '3',
        SUV: '3',
        Coupe: '4',
        Convertible: '5',
        Pickup: '6',
        Van: '7',
        Other: '8'
      };

    return values[value] ?? '';
  }

  private fuelTypeValue(
    value: string
  ): string {
    const values:
      Record<string, string> = {
        Petrol: '1',
        Diesel: '2',
        Electric: '3',
        Hybrid: '4',
        Other: '5'
      };

    return values[value] ?? '';
  }

  private ownershipTypeValue(
    value: string
  ): string {
    const values:
      Record<string, string> = {
        Owned: '1',
        Financed: '2'
      };

    return values[value] ?? '';
  }

  private revokeCurrentImage(): void {
    const currentUrl =
      this.imageUrl();

    if (currentUrl) {
      URL.revokeObjectURL(
        currentUrl
      );
    }

    this.imageUrl.set(null);
  }

  private revokeReplacementPreview():
    void {
    const preview =
      this.replacementPreviewUrl();

    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    this.replacementPreviewUrl
      .set(null);
  }
}
