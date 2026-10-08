import {
  DatePipe,
  DecimalPipe
} from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import {
  Router
} from '@angular/router';
import {
  finalize
} from 'rxjs';

import {
  PolicyEffectiveStatus,
  PolicyListItem
} from '../../../../core/models/policy-billing/policy.models';
import {
  PolicyBillingApi
} from '../../services/policy-billing-api';

@Component({
  selector: 'app-customer-policies',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './customer-policies.html',
  styleUrl: './customer-policies.css'
})
export class CustomerPolicies
  implements OnInit {

  private readonly policyBillingApi =
    inject(PolicyBillingApi);

  private readonly router =
    inject(Router);

  readonly policies =
    signal<PolicyListItem[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.loadPolicies();
  }

  retry(): void {
    this.loadPolicies();
  }

  openPolicy(
    policy: PolicyListItem
  ): void {
    void this.router.navigate([
      '/customer/policies',
      policy.policyId
    ]);
  }

  goToVehicles(): void {
    void this.router.navigate([
      '/customer/vehicles'
    ]);
  }

  goToProfile(): void {
    void this.router.navigate([
      '/customer/profile'
    ]);
  }

  goToUnderwriting(): void {
    void this.router.navigate([
      '/customer/underwriting'
    ]);
  }

  statusClasses(
    status: PolicyEffectiveStatus
  ): string {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700';

      case 'Issued':
        return 'bg-blue-50 text-blue-700';

      case 'Expired':
        return 'bg-zinc-100 text-zinc-600';

      case 'Cancelled':
        return 'bg-red-50 text-red-700';
    }
  }

  statusMessage(
    policy: PolicyListItem
  ): string {
    switch (policy.effectiveStatus) {
      case 'Issued':
        return 'Your Policy has been issued and is waiting for its effective date.';

      case 'Active':
        return 'Your Policy is currently providing coverage for the insured Vehicle.';

      case 'Expired':
        return 'This Policy term has ended and is available as Policy history.';

      case 'Cancelled':
        return 'This Policy has been cancelled and no longer provides active coverage.';
    }
  }

  actionLabel(
    policy: PolicyListItem
  ): string {
    switch (policy.effectiveStatus) {
      case 'Active':
      case 'Issued':
        return 'Manage Policy';

      case 'Expired':
      case 'Cancelled':
        return 'View Policy';
    }
  }
openClaims(): void {
  void this.router.navigate([
    '/customer/claims'
  ]);
}
  private loadPolicies(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.policyBillingApi
      .getMyPolicies()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: policies => {
          this.policies.set(
            policies
          );
        },

        error: error => {
          this.policies.set([]);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not authorized to view Customer Policies.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'Your Customer profile could not be found.'
            );
            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              error?.error?.message ??
              'Policy information is temporarily unavailable. Please try again.'
            );
            return;
          }

          this.errorMessage.set(
            error?.error?.message ??
            'Your Policies could not be loaded. Please try again.'
          );
        }
      });
  }
}
