import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
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
  InternalRegistrationDetail
} from '../../../../core/models/admin-identity.models';
import {
  AdminIdentityApi
} from '../../services/admin-identity-api';

@Component({
  selector: 'app-admin-registration-review',
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './admin-registration-review.html',
  styleUrl: './admin-registration-review.css'
})
export class AdminRegistrationReview implements OnInit {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly adminApi =
    inject(AdminIdentityApi);

  readonly registration =
    signal<InternalRegistrationDetail | null>(null);

  readonly isLoading =
    signal(true);

  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly actionMessage =
    signal<string | null>(null);

  readonly showRejectConfirmation =
    signal(false);

  readonly roles = [
    'Agent',
    'Underwriter',
    'Claims Adjuster'
  ];

  readonly form =
    this.formBuilder.nonNullable.group({
      role: [
        '',
        Validators.required
      ]
    });

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      void this.router.navigate([
        '/admin'
      ]);

      return;
    }

    this.loadRegistration(id);
  }

  approve(): void {
    const registration =
      this.registration();

    if (
      !registration ||
      this.form.invalid ||
      this.isSubmitting()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.actionMessage.set(null);
    this.isSubmitting.set(true);

    this.adminApi
      .approveRegistration(
        registration.id,
        {
          role: this.form.controls.role.value
        }
      )
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.actionMessage.set(
            response.message
          );

          setTimeout(() => {
            void this.router.navigate([
              '/admin'
            ]);
          }, 700);
        },

        error: error => {
          if (error?.status === 409) {
            this.errorMessage.set(
              'This registration is no longer pending.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
              'The registration could not be approved.'
          );
        }
      });
  }

  openRejectConfirmation(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.showRejectConfirmation.set(true);
  }

  cancelReject(): void {
    this.showRejectConfirmation.set(false);
  }

  confirmReject(): void {
    const registration =
      this.registration();

    if (
      !registration ||
      this.isSubmitting()
    ) {
      return;
    }

    this.errorMessage.set(null);
    this.actionMessage.set(null);
    this.isSubmitting.set(true);

    this.adminApi
      .rejectRegistration(
        registration.id
      )
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.showRejectConfirmation.set(false);

          this.actionMessage.set(
            response.message
          );

          setTimeout(() => {
            void this.router.navigate([
              '/admin'
            ]);
          }, 700);
        },

        error: error => {
          this.showRejectConfirmation.set(false);

          if (error?.status === 409) {
            this.errorMessage.set(
              'This registration is no longer pending.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
              'The registration could not be rejected.'
          );
        }
      });
  }

  back(): void {
    void this.router.navigate([
      '/admin'
    ]);
  }

  private loadRegistration(
    id: string
  ): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.adminApi
      .getPendingRegistration(id)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: registration => {
          this.registration.set(
            registration
          );
        },

        error: error => {
          if (error?.status === 404) {
            this.errorMessage.set(
              'The pending registration could not be found.'
            );

            return;
          }

          this.errorMessage.set(
            'The registration could not be loaded. Please try again.'
          );
        }
      });
  }
}
