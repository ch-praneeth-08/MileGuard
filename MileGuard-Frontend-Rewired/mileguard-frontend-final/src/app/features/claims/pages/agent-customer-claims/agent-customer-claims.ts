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
  AgentClaimListItem
} from '../../../../core/models/claims/agent-claim.models';
import {
  ClaimsApi
} from '../../services/claims-api';

@Component({
  selector: 'app-agent-customer-claims',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './agent-customer-claims.html',
  styleUrl:
    './agent-customer-claims.css'
})
export class AgentCustomerClaims
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly claimsApi =
    inject(ClaimsApi);

  readonly claims =
    signal<AgentClaimListItem[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  private customerProfileId = '';

  ngOnInit(): void {
    const customerProfileId =
      this.route.snapshot.paramMap.get(
        'customerId'
      );

    if (!customerProfileId) {
      this.isLoading.set(false);

      this.errorMessage.set(
        'Customer Profile ID is missing.'
      );

      return;
    }

    this.customerProfileId =
      customerProfileId;

    this.loadClaims();
  }

  retry(): void {
    this.loadClaims();
  }

  raiseClaim(): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'claims',
      'new'
    ]);
  }

  openClaim(
    claim: AgentClaimListItem
  ): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'claims',
      claim.claimId
    ]);
  }

  returnToCustomer(): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId
    ]);
  }

  statusLabel(
    status: string
  ): string {
    switch (
      this.normalizedStatus(status)
    ) {
      case 'submitted':
        return 'Submitted';

      case 'inreview':
        return 'In Review';

      case 'approved':
        return 'Approved';

      case 'rejected':
        return 'Rejected';

      case 'settled':
        return 'Settled';

      case 'closed':
        return 'Closed';

      default:
        return status;
    }
  }

  statusClasses(
    status: string
  ): string {
    switch (
      this.normalizedStatus(status)
    ) {
      case 'submitted':
        return 'bg-amber-50 text-amber-700';

      case 'inreview':
        return 'bg-blue-50 text-blue-700';

      case 'approved':
        return 'bg-green-50 text-green-700';

      case 'rejected':
        return 'bg-red-50 text-red-700';

      case 'settled':
        return 'bg-emerald-50 text-emerald-700';

      case 'closed':
        return 'bg-zinc-100 text-zinc-600';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  claimTypeLabel(
    type: string
  ): string {
    switch (
      this.normalizedStatus(type)
    ) {
      case 'accident':
        return 'Accident';

      case 'theft':
        return 'Theft';

      case 'fire':
        return 'Fire';

      case 'naturaldisaster':
        return 'Natural Disaster';

      case 'vandalism':
        return 'Vandalism';

      case 'other':
        return 'Other';

      default:
        return type;
    }
  }

  private loadClaims(): void {
    if (!this.customerProfileId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.claimsApi
      .getAgentCustomerClaims(
        this.customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: claims => {
          this.claims.set(
            claims
          );
        },

        error: error => {
          this.claims.set([]);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.detail ??
              error?.error?.message ??
              'The Customer could not be found.'
            );

            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              error?.error?.detail ??
              error?.error?.message ??
              'Claims information is temporarily unavailable.'
            );

            return;
          }

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Customer Claims could not be loaded.'
          );
        }
      });
  }

  private normalizedStatus(
    value: string
  ): string {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /[\s_-]+/g,
        ''
      );
  }
}
