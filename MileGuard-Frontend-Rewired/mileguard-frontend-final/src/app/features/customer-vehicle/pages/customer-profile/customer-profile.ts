import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSession } from '../../../../core/auth/auth-session';
import { CustomerProfile as CustomerProfileModel } from '../../../../core/models/customer-profile.models';
import { CustomerVehicleApi } from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-customer-profile',
  imports: [
    DatePipe
  ],
  templateUrl: './customer-profile.html',
  styleUrl: './customer-profile.css'
})
export class CustomerProfile implements OnInit {
  private readonly authSession =
    inject(AuthSession);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly router =
    inject(Router);

  readonly currentUser =
    this.authSession.currentUser;

  readonly profile =
    signal<CustomerProfileModel | null>(null);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  editContactAndAddress(): void {
    void this.router.navigate([
      '/customer/profile/edit'
    ]);
  }
viewDriver(): void {
  void this.router.navigate([
    '/customer/driver'
  ]);
}
goToUnderwriting(): void {
  void this.router.navigate([
    '/customer/underwriting'
  ]);
}
openClaims(): void {
  void this.router.navigate([
    '/customer/claims'
  ]);
}
viewGarage(): void {
  void this.router.navigate([
    '/customer/vehicles'
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
          this.profile.set(profile);
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
