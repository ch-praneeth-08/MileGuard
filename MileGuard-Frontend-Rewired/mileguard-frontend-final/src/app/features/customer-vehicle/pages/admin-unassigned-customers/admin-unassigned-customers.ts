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
  UnassignedCustomer
} from '../../../../core/models/agent-assignment.models';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-admin-unassigned-customers',
  imports: [
    DatePipe
  ],
  templateUrl: './admin-unassigned-customers.html',
  styleUrl: './admin-unassigned-customers.css'
})
export class AdminUnassignedCustomers
  implements OnInit {
  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly router =
    inject(Router);

  readonly customers =
    signal<UnassignedCustomer[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.loadCustomers();
  }

review(
  customer: UnassignedCustomer
): void {
  void this.router.navigate([
    '/admin/assignments/customers',
    customer.customerProfileId
  ]);
}

  retry(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.customerVehicleApi
      .getUnassignedCustomers()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: customers => {
          this.customers.set(customers);
        },

        error: error => {
          if (error?.status === 503) {
            this.errorMessage.set(
              'Customer information is temporarily unavailable. Please try again.'
            );

            return;
          }

          this.errorMessage.set(
            'Unassigned customers could not be loaded. Please try again.'
          );
        }
      });
  }
}
