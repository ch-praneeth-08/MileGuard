import {
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

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
} from '../../../customer-vehicle/services/customer-vehicle-api';

import {
  Quote
} from '../../services/quote';

@Component({
  selector: 'app-quote-vehicle-selection',
  imports: [
    DecimalPipe
  ],
  templateUrl:
    './quote-vehicle-selection.html',
  styleUrl:
    './quote-vehicle-selection.css'
})
export class QuoteVehicleSelection
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly quoteApi =
    inject(Quote);

  private customerProfileId:
    string | null = null;

  readonly vehicles =
    signal<Vehicle[]>([]);

  readonly selectedVehicleId =
    signal<string | null>(null);

  readonly isLoading =
    signal(true);

  readonly isStartingQuote =
    signal(false);

  readonly loadingVehicleId =
    signal<string | null>(null);

  readonly errorMessage =
    signal<string | null>(null);

  readonly startErrorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.customerProfileId =
      this.route.snapshot
        .paramMap
        .get('customerId');

    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    this.loadVehicles();
  }

  retry(): void {
    this.loadVehicles();
  }

  selectVehicle(
    vehicle: Vehicle
  ): void {
    if (
      !vehicle.ready ||
      this.isStartingQuote()
    ) {
      return;
    }

    this.startErrorMessage.set(null);

    this.selectedVehicleId.set(
      vehicle.id
    );
  }

  startQuote(): void {
    if (
      !this.customerProfileId ||
      !this.selectedVehicleId() ||
      this.isStartingQuote()
    ) {
      return;
    }

    const vehicleId =
      this.selectedVehicleId();

    if (!vehicleId) {
      return;
    }

    this.startErrorMessage.set(null);

    this.isStartingQuote.set(true);

    this.quoteApi
      .startQuote(
        this.customerProfileId,
        vehicleId
      )
      .pipe(
        finalize(() => {
          this.isStartingQuote.set(
            false
          );
        })
      )
      .subscribe({
        next: response => {
          void this.router.navigate([
            '/agent/customers',
            this.customerProfileId,
            'quotes',
            response.quote.quoteId
          ]);
        },

        error: error => {
          if (error?.status === 403) {
            this.startErrorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.startErrorMessage.set(
              error?.error?.message ??
              'The selected Vehicle could not be found.'
            );

            return;
          }

          if (error?.status === 409) {
            this.startErrorMessage.set(
              error?.error?.message ??
              'The Quote cannot be started with the selected Vehicle.'
            );

            return;
          }

          if (error?.status === 503) {
            this.startErrorMessage.set(
              error?.error?.message ??
              'Quote evaluation is temporarily unavailable. Please try again.'
            );

            return;
          }

          this.startErrorMessage.set(
            error?.error?.message ??
            'The Quote could not be started. Please try again.'
          );
        }
      });
  }

  openVehicle(
    vehicle: Vehicle
  ): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'vehicles',
      vehicle.id
    ]);
  }

  backToQuotes(): void {
    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'quotes'
    ]);
  }

  isSelected(
    vehicle: Vehicle
  ): boolean {
    return (
      this.selectedVehicleId() ===
      vehicle.id
    );
  }

  readyVehicleCount(): number {
    return this.vehicles()
      .filter(
        vehicle =>
          vehicle.ready
      )
      .length;
  }

  private loadVehicles(): void {
    if (!this.customerProfileId) {
      return;
    }

    this.errorMessage.set(null);

    this.startErrorMessage.set(null);

    this.selectedVehicleId.set(null);

    this.isLoading.set(true);

    this.customerVehicleApi
      .getAgentVehicles(
        this.customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: vehicles => {
          this.vehicles.set(
            vehicles
          );
        },

        error: error => {
          this.vehicles.set([]);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              'The Customer could not be found.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Vehicles could not be loaded. Please try again.'
          );
        }
      });
  }
}
