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
  ClaimListItem
} from '../../../../core/models/claims/claim.models';
import {
  ClaimsApi
} from '../../services/claims-api';

@Component({
  selector: 'app-customer-claims',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl:
    './customer-claims.html',
  styleUrl:
    './customer-claims.css'
})
export class CustomerClaims
  implements OnInit {

  private readonly router =
    inject(Router);

  private readonly claimsApi =
    inject(ClaimsApi);

  readonly claims =
    signal<ClaimListItem[]>([]);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  ngOnInit(): void {
    this.loadClaims();
  }

  retry(): void {
    this.loadClaims();
  }

  openClaim(
    claim: ClaimListItem
  ): void {
    void this.router.navigate([
      '/customer/claims',
      claim.claimId
    ]);
  }

  openPolicies(): void {
    void this.router.navigate([
      '/customer/policies'
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

  private loadClaims(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.claimsApi
      .getMyClaims()
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
              'You are not permitted to view Customer Claims.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              this.readErrorMessage(
                error,
                'Your Customer profile could not be found.'
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
              'Your Claims could not be loaded.'
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
