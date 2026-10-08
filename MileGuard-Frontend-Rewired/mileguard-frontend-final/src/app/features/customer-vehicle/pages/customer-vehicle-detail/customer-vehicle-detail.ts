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
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  Vehicle
} from '../../../../core/models/vehicle.models';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-customer-vehicle-detail',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './customer-vehicle-detail.html',
  styleUrl:
    './customer-vehicle-detail.css'
})
export class CustomerVehicleDetail
  implements OnInit, OnDestroy {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  readonly vehicle =
    signal<Vehicle | null>(
      null
    );

  readonly imageUrl =
    signal<string | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly isLoadingImage =
    signal(false);

  readonly errorMessage =
  signal<string | null>(
    null
  );

readonly imageErrorMessage =
  signal<string | null>(
    null
  );

  private vehicleId:
    string | null = null;

  ngOnInit(): void {
    this.vehicleId =
      this.route.snapshot
        .paramMap
        .get('vehicleId');

    if (!this.vehicleId) {
      this.backToGarage();
      return;
    }

    this.loadVehicle();
  }

  ngOnDestroy(): void {
    this.revokeImageUrl();
  }

  backToGarage(): void {
    void this.router.navigate([
      '/customer/vehicles'
    ]);
  }
viewDriver(): void {
  void this.router.navigate([
    '/customer/driver'
  ]);
}
  backToProfile(): void {
    void this.router.navigate([
      '/customer/profile'
    ]);
  }

  retry(): void {
    this.loadVehicle();
  }

  private loadVehicle(): void {
  if (!this.vehicleId) {
    return;
  }

  this.errorMessage.set(null);
  this.imageErrorMessage.set(null);
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
        this.vehicle.set(vehicle);

        if (vehicle.hasImage) {
          this.loadImage(
            vehicle.id
          );
        } else {
          this.revokeImageUrl();
        }
      },

      error: error => {
        this.vehicle.set(null);

        if (error?.status === 403) {
          this.errorMessage.set(
            'You are not authorized to view this Vehicle.'
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
  this.imageErrorMessage.set(null);
  this.isLoadingImage.set(true);

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
      next: blob => {
        this.revokeImageUrl();

        this.imageUrl.set(
          URL.createObjectURL(
            blob
          )
        );
      },

      error: error => {
        this.revokeImageUrl();

        /*
         * No image is a valid state because
         * Vehicle images are optional.
         */
        if (error?.status === 404) {
          return;
        }

        if (error?.status === 403) {
          this.imageErrorMessage.set(
            'You are not authorized to view this Vehicle image.'
          );

          return;
        }

        this.imageErrorMessage.set(
          'Vehicle image could not be loaded.'
        );
      }
    });
}
  private revokeImageUrl(): void {
    const currentUrl =
      this.imageUrl();

    if (currentUrl) {
      URL.revokeObjectURL(
        currentUrl
      );
    }

    this.imageUrl.set(null);
  }
}
