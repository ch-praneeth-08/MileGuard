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
  AgentClaimDetail
} from '../../../../core/models/claims/agent-claim.models';
import {
  ClaimsApi
} from '../../services/claims-api';

@Component({
  selector: 'app-agent-claim-detail',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './agent-claim-detail.html',
  styleUrl:
    './agent-claim-detail.css'
})
export class AgentClaimDetailPage
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly claimsApi =
    inject(ClaimsApi);

  readonly claim =
    signal<AgentClaimDetail | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(
      null
    );

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

    this.loadClaim();
  }

  retry(): void {
    this.loadClaim();
  }

  returnToClaims(): void {
    if (!this.customerProfileId) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'claims'
    ]);
  }

  openPolicy(): void {
    const currentClaim =
      this.claim();

    if (
      !currentClaim ||
      !this.customerProfileId
    ) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'policies',
      currentClaim.policyId
    ]);
  }

  statusLabel(
    status: string
  ): string {
    switch (
      this.normalize(status)
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
      this.normalize(status)
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

  typeLabel(
    type: string
  ): string {
    switch (
      this.normalize(type)
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

  statusMessage(
    claim: AgentClaimDetail
  ): string {
    switch (
      this.normalize(
        claim.status
      )
    ) {
      case 'submitted':
        return 'The Claim has been submitted and is waiting for Claims administration and review.';

      case 'inreview':
        return 'The assigned Claims Officer is currently reviewing the Claim.';

      case 'approved':
        return 'The Claim has been approved and is awaiting settlement.';

      case 'rejected':
        return 'The Claim was not approved. Review the decision information below.';

      case 'settled':
        return 'The Claim settlement has been recorded and the Claim is ready for closure.';

      case 'closed':
        return 'The Claim lifecycle has been completed and the Claim is now closed.';

      default:
        return 'Review the current Claim status and details below.';
    }
  }

  private loadClaim(): void {
    const claimId =
      this.route.snapshot.paramMap.get(
        'claimId'
      );

    if (!claimId) {
      this.isLoading.set(false);

      this.errorMessage.set(
        'Claim ID is missing.'
      );

      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.claimsApi
      .getAgentClaim(
        claimId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: claim => {
          if (
            this.customerProfileId &&
            claim.customerProfileId !==
              this.customerProfileId
          ) {
            this.claim.set(null);

            this.errorMessage.set(
              'This Claim does not belong to the current Customer workspace.'
            );

            return;
          }

          this.claim.set(
            claim
          );
        },

        error: error => {
          this.claim.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not permitted to view this Claim.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              this.readErrorMessage(
                error,
                'The Claim could not be found.'
              )
            );

            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              this.readErrorMessage(
                error,
                'Claims information is temporarily unavailable.'
              )
            );

            return;
          }

          this.errorMessage.set(
            this.readErrorMessage(
              error,
              'The Claim could not be loaded.'
            )
          );
        }
      });
  }

  private readErrorMessage(
    error: any,
    fallback: string
  ): string {
    if (
      typeof error?.error?.detail ===
      'string'
    ) {
      return error.error.detail;
    }

    if (
      typeof error?.error?.message ===
      'string'
    ) {
      return error.error.message;
    }

    return fallback;
  }

  private normalize(
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
