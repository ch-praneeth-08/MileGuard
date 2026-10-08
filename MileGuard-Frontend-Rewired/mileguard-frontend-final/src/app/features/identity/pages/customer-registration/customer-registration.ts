import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthApi } from '../../services/auth-api';

@Component({
  selector: 'app-customer-registration',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './customer-registration.html',
  styleUrl: './customer-registration.css'
})
export class CustomerRegistration {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group(
    {
      firstName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          passwordComplexityValidator()
        ]
      ],
      confirmPassword: [
        '',
        Validators.required
      ]
    },
    {
      validators: passwordsMatchValidator()
    }
  );

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(value => !value);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authApi
      .registerCustomer(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: () => {
          void this.router.navigate([
            '/register/success'
          ]);
        },

        error: error => {
          this.errorMessage.set(
            error?.error?.message ??
              'Registration could not be completed. Please try again.'
          );
        }
      });
  }
}

function passwordsMatchValidator(): ValidatorFn {
  return (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : {
          passwordsMismatch: true
        };
  };
}

function passwordComplexityValidator(): ValidatorFn {
  return (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.value as string;

    if (!password) {
      return null;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialCharacter =
      /[^A-Za-z0-9]/.test(password);

    const isValid =
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialCharacter;

    return isValid
      ? null
      : {
          passwordComplexity: true
        };
  };
}
