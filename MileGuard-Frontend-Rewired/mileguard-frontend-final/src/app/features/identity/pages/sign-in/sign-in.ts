import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { AuthSession } from '../../../../core/auth/auth-session';
import { PreAuth } from '../../../../core/auth/pre-auth';
import { AuthApi } from '../../services/auth-api';

@Component({
  selector: 'app-sign-in',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSession);
  private readonly preAuth = inject(PreAuth);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      Validators.required
    ]
  });

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authApi
      .login(this.form.getRawValue())
      .pipe(
        switchMap(response => {
          if (
            response.status === 'Authenticated' &&
            response.accessToken
          ) {
            this.authSession.setAccessToken(
              response.accessToken
            );

            return this.authApi.getCurrentUser();
          }

          if (response.status === 'Pending') {
            void this.router.navigate([
              '/internal/pending'
            ]);

            throw new AuthFlowRedirect();
          }

          if (response.status === 'Rejected') {
            void this.router.navigate([
              '/internal/rejected'
            ]);

            throw new AuthFlowRedirect();
          }

          if (response.status === 'Inactive') {
            void this.router.navigate([
              '/internal/inactive'
            ]);

            throw new AuthFlowRedirect();
          }

          if (
            (
              response.status === 'TwoFactorSetupRequired' ||
              response.status === 'TwoFactorRequired'
            ) &&
            response.preAuthToken &&
            response.email &&
            response.role
          ) {
            const requiresSetup =
              response.status === 'TwoFactorSetupRequired';

            this.preAuth.set({
              token: response.preAuthToken,
              email: response.email,
              role: response.role,
              requiresSetup
            });

            void this.router.navigate([
              requiresSetup
                ? '/two-factor/setup'
                : '/two-factor'
            ]);

            throw new AuthFlowRedirect();
          }

          throw new Error(
            'Unexpected authentication response.'
          );
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: currentUser => {
          this.authSession.setCurrentUser(currentUser);

          void this.navigateForRole(
            currentUser.role
          );
        },

        error: error => {
          if (error instanceof AuthFlowRedirect) {
            return;
          }

          if (error?.status === 401) {
            this.errorMessage.set(
              'The email or password you entered is incorrect.'
            );

            return;
          }

          this.errorMessage.set(
            'We could not sign you in. Please try again.'
          );
        }
      });
  }

  private async navigateForRole(
    role: string
  ): Promise<void> {
    switch (role) {
      case 'Customer':
        await this.router.navigate([
          '/customer'
        ]);
        break;


      case 'Agent':
        await this.router.navigate([
          '/agent'
        ]);
        break;

      case 'Underwriter':
        await this.router.navigate([
          '/underwriter'
        ]);
        break;

      case 'Claims Adjuster':
      case 'Claims Officer':
      case 'ClaimsOfficer':
        await this.router.navigate([
          '/claims-officer'
        ]);
        break;

      case 'Admin':
        await this.router.navigate([
          '/admin'
        ]);
        break;

      default:
        this.authSession.clear();

        this.errorMessage.set(
          'Your account does not have access to this application.'
        );
    }
  }
}

class AuthFlowRedirect extends Error { }
