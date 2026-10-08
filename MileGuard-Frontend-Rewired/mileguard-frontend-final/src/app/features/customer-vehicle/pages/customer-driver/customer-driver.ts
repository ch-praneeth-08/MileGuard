import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  Driver
} from '../../../../core/models/driver.models';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-customer-driver',
  imports: [
    DatePipe
  ],
  templateUrl: './customer-driver.html',
  styleUrl: './customer-driver.css'
})
export class CustomerDriver implements OnInit {
  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly router =
    inject(Router);

  readonly driver =
    signal<Driver | null>(null);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  readonly driverNotConfigured =
    signal(false);

  ngOnInit(): void {
    this.loadDriver();
  }

  backToProfile(): void {
    void this.router.navigate([
      '/customer/profile'
    ]);
  }

  retry(): void {
    this.loadDriver();
  }

  private loadDriver(): void {
    this.errorMessage.set(null);
    this.driverNotConfigured.set(false);
    this.isLoading.set(true);

    this.customerVehicleApi
      .getMyDriver()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: driver => {
          this.driver.set(driver);
        },

        error: error => {
          this.driver.set(null);

          if (error?.status === 404) {
            this.driverNotConfigured.set(
              true
            );

            return;
          }

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to view this Driver information.'
            );

            return;
          }

          this.errorMessage.set(
            'Primary Driver information could not be loaded. Please try again.'
          );
        }
      });
  }
}
