import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { finalize } from 'rxjs';

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

type VehicleStep =
  | 1
  | 2
  | 3
  | 4;

@Component({
  selector: 'app-agent-add-vehicle',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './agent-add-vehicle.html',
  styleUrl: './agent-add-vehicle.css'
})
export class AgentAddVehicle
  implements OnInit, OnDestroy {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private customerProfileId:
    string | null = null;

  private createdVehicle:
    Vehicle | null = null;

  readonly currentStep =
    signal<VehicleStep>(1);

  readonly selectedImage =
    signal<File | null>(null);

  readonly imagePreviewUrl =
    signal<string | null>(null);

  readonly imageErrorMessage =
    signal<string | null>(null);

  readonly errorMessage =
    signal<string | null>(null);

  readonly isSaving =
    signal(false);

  readonly vehicleCreated =
    signal(false);

  readonly form =
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
        .get('id');

    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);
    }
  }

  ngOnDestroy(): void {
    this.revokeImagePreview();
  }

  next(): void {
    this.errorMessage.set(null);

    if (this.currentStep() === 1) {
      if (!this.validateVehicleDetails()) {
        return;
      }

      this.currentStep.set(2);
      return;
    }

    if (this.currentStep() === 2) {
      if (!this.validateOwnershipAndUsage()) {
        return;
      }

      this.currentStep.set(3);
      return;
    }

    if (this.currentStep() === 3) {
      this.currentStep.set(4);
    }
  }

  previous(): void {
    if (
      this.currentStep() <= 1 ||
      this.isSaving()
    ) {
      return;
    }

    this.errorMessage.set(null);

    this.currentStep.update(
      step =>
        (step - 1) as VehicleStep
    );
  }

  goToStep(
    step: VehicleStep
  ): void {
    if (
      step < this.currentStep() &&
      !this.isSaving()
    ) {
      this.currentStep.set(step);
    }
  }

  onImageSelected(
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

    if (file.size > maximumSize) {
      input.value = '';

      this.imageErrorMessage.set(
        'Vehicle image cannot exceed 5 MB.'
      );

      return;
    }

    this.revokeImagePreview();

    this.selectedImage.set(file);

    this.imagePreviewUrl.set(
      URL.createObjectURL(file)
    );
  }

  removeImage(): void {
    this.revokeImagePreview();

    this.selectedImage.set(null);
    this.imageErrorMessage.set(null);
  }

  saveVehicle(): void {
    if (
      !this.customerProfileId ||
      this.form.invalid ||
      this.isSaving()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const values =
      this.form.getRawValue();

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
    this.imageErrorMessage.set(null);
    this.isSaving.set(true);

    this.customerVehicleApi
      .createAgentVehicle(
        this.customerProfileId,
        request
      )
      .subscribe({
        next: vehicle => {
          this.createdVehicle =
            vehicle;

          this.vehicleCreated.set(
            true
          );

          const image =
            this.selectedImage();

          if (!image) {
            this.finish(vehicle.id);
            return;
          }

          this.uploadImage(
            vehicle.id,
            image
          );
        },

        error: error => {
          this.isSaving.set(false);

          if (error?.status === 409) {
            this.errorMessage.set(
              error?.error?.message ??
              'VIN or Registration Number is already in use.'
            );

            return;
          }

          if (error?.status === 403) {
            this.errorMessage.set(
              'This customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              'The customer could not be found.'
            );

            return;
          }

          if (error?.status === 400) {
            this.errorMessage.set(
              error?.error?.message ??
              'Please review the Vehicle information.'
            );

            return;
          }

          this.errorMessage.set(
            'Vehicle could not be created. Please try again.'
          );
        }
      });
  }

  continueWithoutImage(): void {
    const vehicle =
      this.createdVehicle;

    if (!vehicle) {
      return;
    }

    this.finish(vehicle.id);
  }

  cancel(): void {
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

  vehicleTypeLabel(): string {
    const value =
      Number(
        this.form.controls
          .vehicleType.value
      );

    const labels:
      Record<number, string> = {
        1: 'Sedan',
        2: 'Hatchback',
        3: 'SUV',
        4: 'Coupe',
        5: 'Convertible',
        6: 'Pickup',
        7: 'Van',
        8: 'Other'
      };

    return labels[value] ??
      'Not selected';
  }

  fuelTypeLabel(): string {
    const value =
      Number(
        this.form.controls
          .fuelType.value
      );

    const labels:
      Record<number, string> = {
        1: 'Petrol',
        2: 'Diesel',
        3: 'Electric',
        4: 'Hybrid',
        5: 'Other'
      };

    return labels[value] ??
      'Not selected';
  }

  ownershipTypeLabel(): string {
    return Number(
      this.form.controls
        .ownershipType.value
    ) === 2
      ? 'Financed'
      : 'Owned';
  }

  private uploadImage(
    vehicleId: string,
    file: File
  ): void {
    this.customerVehicleApi
      .uploadVehicleImage(
        vehicleId,
        file
      )
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.finish(
            vehicleId
          );
        },

        error: error => {
          /*
           * Vehicle creation has already succeeded.
           * Do not attempt to create the Vehicle again.
           */
          this.imageErrorMessage.set(
            error?.error?.message ??
            'Vehicle was created, but the image could not be uploaded. You can continue without the image.'
          );
        }
      });
  }

  private finish(
    vehicleId: string
  ): void {
    this.isSaving.set(false);

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'vehicles',
      vehicleId
    ]);
  }

  private validateVehicleDetails():
    boolean {
    const controls = [
      this.form.controls.vin,
      this.form.controls
        .registrationNumber,
      this.form.controls.make,
      this.form.controls.model,
      this.form.controls
        .manufacturingYear,
      this.form.controls.vehicleType,
      this.form.controls.fuelType
    ];

    controls.forEach(
      control =>
        control.markAsTouched()
    );

    return controls.every(
      control =>
        control.valid
    );
  }

  private validateOwnershipAndUsage():
    boolean {
    const controls = [
      this.form.controls.vehicleValue,
      this.form.controls
        .currentOdometer,
      this.form.controls
        .annualMileage,
      this.form.controls
        .ownershipType,
      this.form.controls.purchaseDate
    ];

    controls.forEach(
      control =>
        control.markAsTouched()
    );

    return controls.every(
      control =>
        control.valid
    );
  }

  private revokeImagePreview(): void {
    const currentUrl =
      this.imagePreviewUrl();

    if (currentUrl) {
      URL.revokeObjectURL(
        currentUrl
      );
    }

    this.imagePreviewUrl.set(null);
  }
}
