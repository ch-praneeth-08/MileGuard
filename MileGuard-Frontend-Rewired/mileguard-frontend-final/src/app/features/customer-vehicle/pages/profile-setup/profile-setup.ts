import {
  Component,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSession } from '../../../../core/auth/auth-session';
import {
  AreaType,
  CreateCustomerProfileRequest
} from '../../../../core/models/customer-profile.models';
import { CustomerVehicleApi } from '../../services/customer-vehicle-api';

type ProfileStep =
  | 1
  | 2
  | 3
  | 4;

@Component({
  selector: 'app-profile-setup',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './profile-setup.html',
  styleUrl: './profile-setup.css'
})
export class ProfileSetup {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authSession =
    inject(AuthSession);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly router =
    inject(Router);

  readonly currentStep =
    signal<ProfileStep>(1);

  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly currentUser =
    this.authSession.currentUser;

  readonly form =
    this.formBuilder.nonNullable.group({
      dateOfBirth: [
        '',
        Validators.required
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.maxLength(30)
        ]
      ],

      addressLine1: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],

      addressLine2: [
        '',
        Validators.maxLength(200)
      ],

      city: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      state: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      postalCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(20)
        ]
      ],

      areaType: [
        '',
        Validators.required
      ]
    });

  next(): void {
    this.errorMessage.set(null);

    if (this.currentStep() === 1) {
      this.currentStep.set(2);
      return;
    }

    if (this.currentStep() === 2) {
      const dateOfBirth =
        this.form.controls.dateOfBirth;

      const phone =
        this.form.controls.phone;

      dateOfBirth.markAsTouched();
      phone.markAsTouched();

      if (
        dateOfBirth.invalid ||
        phone.invalid
      ) {
        return;
      }

      this.currentStep.set(3);
      return;
    }

    if (this.currentStep() === 3) {
      const controls = [
        this.form.controls.addressLine1,
        this.form.controls.city,
        this.form.controls.state,
        this.form.controls.postalCode,
        this.form.controls.areaType
      ];

      controls.forEach(control =>
        control.markAsTouched()
      );

      if (
        controls.some(
          control => control.invalid
        )
      ) {
        return;
      }

      this.currentStep.set(4);
    }
  }

  previous(): void {
    const step =
      this.currentStep();

    if (step > 1) {
      this.currentStep.set(
        (step - 1) as ProfileStep
      );
    }
  }

  goToStep(
    step: ProfileStep
  ): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  completeProfile(): void {
    if (
      this.form.invalid ||
      this.isSubmitting()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const values =
      this.form.getRawValue();

    const request:
      CreateCustomerProfileRequest = {
        dateOfBirth:
          values.dateOfBirth,

        phone:
          values.phone.trim(),

        addressLine1:
          values.addressLine1.trim(),

        addressLine2:
          values.addressLine2.trim()
            ? values.addressLine2.trim()
            : null,

        city:
          values.city.trim(),

        state:
          values.state.trim(),

        postalCode:
          values.postalCode.trim(),

        areaType:
          Number(
            values.areaType
          ) as AreaType
      };

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.customerVehicleApi
      .createMyProfile(request)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: () => {
          void this.router.navigate([
            '/customer/profile'
          ]);
        },

        error: error => {
          if (error?.status === 409) {
            void this.router.navigate([
              '/customer/profile'
            ]);

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Your profile could not be completed. Please review your details and try again.'
          );
        }
      });
  }
}
