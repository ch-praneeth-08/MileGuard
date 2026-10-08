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
import {
  AgentCustomerListItem
} from '../../../../core/models/agent-customer.models';
import { AuthApi } from '../../../identity/services/auth-api';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-agent-my-customers',
  imports: [
    DatePipe
  ],
  templateUrl: './agent-my-customers.html',
  styleUrl: './agent-my-customers.css'
})
export class AgentMyCustomers implements OnInit {
  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  private readonly authApi =
    inject(AuthApi);

  private readonly authSession =
    inject(AuthSession);

  private readonly router =
    inject(Router);

  readonly customers =
    signal<AgentCustomerListItem[]>([]);

  readonly isLoading =
    signal(true);

  readonly isLoggingOut =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly currentUser =
    this.authSession.currentUser;

  ngOnInit(): void {
    this.loadCustomers();
  }

  openCustomer(
    customer: AgentCustomerListItem
  ): void {
    void this.router.navigate([
      '/agent/customers',
      customer.customerProfileId
    ]);
  }

  retry(): void {
    this.loadCustomers();
  }

  logout(): void {
    if (this.isLoggingOut()) {
      return;
    }

    this.isLoggingOut.set(true);

    this.authApi
      .logout()
      .pipe(
        finalize(() => {
          this.isLoggingOut.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.authSession.clear();

          void this.router.navigate([
            '/login'
          ]);
        },

        error: () => {
          this.authSession.clear();

          void this.router.navigate([
            '/login'
          ]);
        }
      });
  }

  private loadCustomers(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.customerVehicleApi
      .getAgentCustomers()
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
          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to access the Agent customer workspace.'
            );

            return;
          }

          this.errorMessage.set(
            'Your assigned customers could not be loaded. Please try again.'
          );
        }
      });
  }
}
