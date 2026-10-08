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
  ClaimDetail
} from '../../../../core/models/claims/claim.models';
import {
  ClaimsApi
} from '../../services/claims-api';

@Component({
  selector: 'app-customer-claim-detail',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './customer-claim-detail.html',
  styleUrl:
    './customer-claim-detail.css'
})
export class CustomerClaimDetailPage
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly claimsApi =
    inject(ClaimsApi);

  readonly claim =
    signal<ClaimDetail | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  ngOnInit(): void {
    this.loadClaim();
  }

  retry(): void {
    this.loadClaim();
  }

  returnToClaims(): void {
    void this.router.navigate([
      '/customer/claims'
    ]);
  }

  openPolicy(): void {
    const currentClaim =
      this.claim();

    if (!currentClaim) {
      return;
    }

    void this.router.navigate([
      '/customer/policies',
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

  claimTypeLabel(
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
    currentClaim: ClaimDetail
  ): string {
    switch (
      this.normalize(
        currentClaim.status
      )
    ) {
      case 'submitted':
        return 'Your Claim has been submitted and is waiting for Claims processing.';

      case 'inreview':
        return 'Your Claim is currently being reviewed by the assigned Claims Officer.';

      case 'approved':
        return 'Your Claim has been approved and is awaiting settlement.';

      case 'rejected':
        return 'Your Claim was not approved. Review the decision reason below.';

      case 'settled':
        return 'The approved settlement has been recorded for your Claim.';

      case 'closed':
        return 'This Claim has completed its processing lifecycle and is now closed.';

      default:
        return 'Review the current status and Claim information below.';
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
      .getMyClaim(
        claimId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: claim => {
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
