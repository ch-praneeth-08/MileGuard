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
  ActivatedRoute,
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
  selector: 'app-agent-customer-policies',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './agent-customer-policies.html',
  styleUrl: './agent-customer-policies.css'
})
export class AgentCustomerPolicies
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly policyBillingApi =
    inject(PolicyBillingApi);

  private customerProfileId:
    string | null = null;

  readonly policies =
    signal<PolicyListItem[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.customerProfileId =
      this.route.snapshot.paramMap.get(
        'customerId'
      );

    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    this.loadPolicies();
  }

  retry(): void {
    this.loadPolicies();
  }

  backToCustomer(): void {
    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId
    ]);
  }

  openPolicy(
    policy: PolicyListItem
  ): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'policies',
      policy.policyId
    ]);
  }

  statusClasses(
    status: PolicyEffectiveStatus
  ): string {
    switch (status) {
      case 'Issued':
        return 'bg-blue-50 text-blue-700';

      case 'Active':
        return 'bg-green-50 text-green-700';

      case 'Expired':
        return 'bg-zinc-100 text-zinc-600';

      case 'Cancelled':
        return 'bg-red-50 text-red-700';
    }
  }

  actionLabel(
    policy: PolicyListItem
  ): string {
    switch (policy.effectiveStatus) {
      case 'Issued':
      case 'Active':
        return 'View Policy';

      case 'Expired':
      case 'Cancelled':
        return 'View History';
    }
  }

  private loadPolicies(): void {
    if (!this.customerProfileId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.policyBillingApi
      .getAgentCustomerPolicies(
        this.customerProfileId
      )
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
              'This Customer is not assigned to your Agent account.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'The Customer could not be found.'
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
            'Customer Policies could not be loaded. Please try again.'
          );
        }
      });
  }
}
