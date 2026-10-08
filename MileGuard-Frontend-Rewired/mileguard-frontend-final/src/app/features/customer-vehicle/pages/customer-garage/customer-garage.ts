import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  Vehicle
} from '../../../../core/models/vehicle.models';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-customer-garage',
  imports: [],
  templateUrl: './customer-garage.html',
  styleUrl: './customer-garage.css'
})
export class CustomerGarage
  implements OnInit, OnDestroy {

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly router =
    inject(Router);

  readonly vehicles =
    signal<Vehicle[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  readonly imageUrls =
    signal<Record<string, string>>({});

  ngOnInit(): void {
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.revokeAllImageUrls();
  }

  backToProfile(): void {
    void this.router.navigate([
      '/customer/profile'
    ]);
  }

  viewDriver(): void {
    void this.router.navigate([
      '/customer/driver'
    ]);
  }

  openVehicle(
    vehicle: Vehicle
  ): void {
    void this.router.navigate([
      '/customer/vehicles',
      vehicle.id
    ]);
  }

  retry(): void {
    this.loadVehicles();
  }

  vehicleImageUrl(
    vehicleId: string
  ): string | null {
    return (
      this.imageUrls()[vehicleId] ??
      null
    );
  }

  private loadVehicles(): void {
    this.errorMessage.set(null);

    this.isLoading.set(true);

    this.customerVehicleApi
      .getMyVehicles()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: vehicles => {
          this.revokeAllImageUrls();

          this.vehicles.set(
            vehicles
          );

          for (
            const vehicle of vehicles
          ) {
            if (vehicle.hasImage) {
              this.loadVehicleImage(
                vehicle.id
              );
            }
          }
        },

        error: error => {
          this.revokeAllImageUrls();

          this.vehicles.set([]);

          if (error?.status === 404) {
            this.errorMessage.set(
              'Your Customer profile could not be found.'
            );

            return;
          }

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to view this Garage.'
            );

            return;
          }

          this.errorMessage.set(
            'Your Garage could not be loaded. Please try again.'
          );
        }
      });
  }

  private loadVehicleImage(
    vehicleId: string
  ): void {
    this.customerVehicleApi
      .getVehicleImage(
        vehicleId
      )
      .subscribe({
        next: blob => {
          const existingUrl =
            this.imageUrls()[vehicleId];

          if (existingUrl) {
            URL.revokeObjectURL(
              existingUrl
            );
          }

          const imageUrl =
            URL.createObjectURL(
              blob
            );

          this.imageUrls.update(
            current => ({
              ...current,
              imageUrl
            })
          );
        },

        error: () => {
          /*
           * Vehicle images are optional.
           *
           * Missing or unavailable image content must not
           * prevent the Garage from rendering the Vehicle.
           */
        }
      });
  }

  private revokeAllImageUrls(): void {
    const urls =
      Object.values(
        this.imageUrls()
      );

    for (const url of urls) {
      URL.revokeObjectURL(url);
    }

    this.imageUrls.set({});
  }
}
