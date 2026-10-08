import {
  Component,
  OnInit,
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

import { CustomerProfile } from '../../../../core/models/customer-profile.models';
import { CustomerVehicleApi } from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-edit-customer-profile',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './edit-customer-profile.html',
  styleUrl: './edit-customer-profile.css'
})
export class EditCustomerProfile implements OnInit {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly router =
    inject(Router);

  readonly profile =
    signal<CustomerProfile | null>(null);

  readonly isLoading =
    signal(true);

  readonly isSaving =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly form =
    this.formBuilder.nonNullable.group({
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
      ]
    });

  ngOnInit(): void {
    this.loadProfile();
  }

  save(): void {
    if (
      this.form.invalid ||
      this.isSaving()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const values =
      this.form.getRawValue();

    this.errorMessage.set(null);
    this.isSaving.set(true);

    this.customerVehicleApi
      .updateMyProfile({
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
          values.postalCode.trim()
      })
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        })
      )
      .subscribe({
        next: () => {
          void this.router.navigate([
            '/customer/profile'
          ]);
        },

        error: error => {
          if (error?.status === 404) {
            void this.router.navigate([
              '/customer/profile/setup'
            ]);

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
              'Your profile could not be updated. Please review your information and try again.'
          );
        }
      });
  }

  cancel(): void {
    void this.router.navigate([
      '/customer/profile'
    ]);
  }

  retry(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.customerVehicleApi
      .getMyProfile()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: profile => {
          if (
            profile.profileStatus !==
            'Complete'
          ) {
            void this.router.navigate([
              '/customer/profile/setup'
            ]);

            return;
          }

          this.profile.set(profile);

          this.form.patchValue({
            phone:
              profile.phone ?? '',

            addressLine1:
              profile.addressLine1 ?? '',

            addressLine2:
              profile.addressLine2 ?? '',

            city:
              profile.city ?? '',

            state:
              profile.state ?? '',

            postalCode:
              profile.postalCode ?? ''
          });
        },

        error: error => {
          if (error?.status === 404) {
            void this.router.navigate([
              '/customer/profile/setup'
            ]);

            return;
          }

          this.errorMessage.set(
            'Your profile could not be loaded. Please try again.'
          );
        }
      });
  }
}
