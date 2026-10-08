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
import { PreAuth } from '../../../../core/auth/pre-auth';
import { AuthApi } from '../../services/auth-api';

@Component({
  selector: 'app-two-factor-challenge',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './two-factor-challenge.html',
  styleUrl: './two-factor-challenge.css'
})
export class TwoFactorChallenge {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  private readonly preAuth =
    inject(PreAuth);

  private readonly router =
    inject(Router);

  readonly isVerifying =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly email =
    signal<string>('');

  readonly role =
    signal<string>('');

  readonly form =
    this.formBuilder.nonNullable.group({
      code: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{6}$/)
        ]
      ]
    });

  constructor() {
    const state =
      this.preAuth.state();

    if (
      !state ||
      state.requiresSetup
    ) {
      void this.router.navigate([
        '/login'
      ]);

      return;
    }

    this.email.set(
      state.email
    );

    this.role.set(
      state.role
    );
  }

  verify(): void {
    if (
      this.form.invalid ||
      this.isVerifying()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const state =
      this.preAuth.state();

    if (
      !state ||
      state.requiresSetup
    ) {
      void this.router.navigate([
        '/login'
      ]);

      return;
    }

    this.errorMessage.set(null);
    this.isVerifying.set(true);

    this.authApi
      .verifyTwoFactor(
        state.token,
        this.form.controls.code.value
      )
      .pipe(
        finalize(() => {
          this.isVerifying.set(false);
        })
      )
      .subscribe({
        next: response => {
          if (
            response.status !== 'Authenticated' ||
            !response.accessToken
          ) {
            this.errorMessage.set(
              'Two-factor verification could not be completed.'
            );

            return;
          }

          this.authSession.setAccessToken(
            response.accessToken
          );

          this.authApi
            .getCurrentUser()
            .subscribe({
              next: currentUser => {
                this.authSession.setCurrentUser(
                  currentUser
                );

                this.preAuth.clear();

                void this.navigateForRole(
                  currentUser.role
                );
              },

              error: () => {
                this.authSession.clear();

                this.errorMessage.set(
                  'Your account information could not be loaded. Please sign in again.'
                );
              }
            });
        },

        error: error => {
          if (error?.status === 400) {
            this.form.controls.code.reset();

            this.errorMessage.set(
              error?.error?.message ??
                'The verification code is invalid.'
            );

            return;
          }

          if (error?.status === 401) {
            this.preAuth.clear();

            void this.router.navigate([
              '/login'
            ]);

            return;
          }

          this.errorMessage.set(
            'Two-factor verification could not be completed. Please try again.'
          );
        }
      });
  }

  backToSignIn(): void {
    this.preAuth.clear();

    void this.router.navigate([
      '/login'
    ]);
  }

  private async navigateForRole(
    role: string
  ): Promise<void> {
    switch (role) {
      case 'Admin':
        await this.router.navigate([
          '/admin'
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

      default:
        this.authSession.clear();

        await this.router.navigate([
          '/login'
        ]);
    }
  }
}
