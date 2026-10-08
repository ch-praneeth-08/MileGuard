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
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  forkJoin,
  finalize
} from 'rxjs';

import {
  AdminClaimDetail,
  EligibleClaimsOfficer
} from '../../../../core/models/claims/admin-claim.models';
import {
  ClaimsApi
} from '../../services/claims-api';

@Component({
  selector: 'app-admin-claim-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl:
    './admin-claim-detail.html',
  styleUrl:
    './admin-claim-detail.css'
})
export class AdminClaimDetailPage
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly claimsApi =
    inject(ClaimsApi);

  readonly claim =
    signal<AdminClaimDetail | null>(
      null
    );

  readonly claimsOfficers =
    signal<EligibleClaimsOfficer[]>(
      []
    );

  readonly isLoading =
    signal(true);

  readonly isAssigning =
    signal(false);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  readonly assignmentError =
    signal<string | null>(
      null
    );

  readonly assignmentConfirmationOpen =
    signal(false);

  readonly selectedClaimsOfficerId =
    new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    );

  ngOnInit(): void {
    this.loadPage();
  }

  retry(): void {
    this.loadPage();
  }

  returnToUnassignedClaims(): void {
    void this.router.navigate([
      '/admin/claims'
    ]);
  }

  selectClaimsOfficer(
    claimsOfficer: EligibleClaimsOfficer
  ): void {
    if (
      this.isAssigning() ||
      this.claim()?.assignedClaimsOfficerIdentityUserId
    ) {
      return;
    }

    this.selectedClaimsOfficerId.setValue(
      claimsOfficer.identityUserId
    );

    this.assignmentError.set(null);
  }

  isSelected(
    claimsOfficer: EligibleClaimsOfficer
  ): boolean {
    return (
      this.selectedClaimsOfficerId.value ===
      claimsOfficer.identityUserId
    );
  }

  selectedClaimsOfficer():
    EligibleClaimsOfficer | null {
    const selectedId =
      this.selectedClaimsOfficerId.value;

    if (!selectedId) {
      return null;
    }

    return (
      this.claimsOfficers().find(
        claimsOfficer =>
          claimsOfficer.identityUserId ===
          selectedId
      ) ??
      null
    );
  }

  openAssignmentConfirmation():
    void {
    const currentClaim =
      this.claim();

    if (
      !currentClaim ||
      currentClaim
        .assignedClaimsOfficerIdentityUserId ||
      this.selectedClaimsOfficerId.invalid ||
      this.isAssigning()
    ) {
      this.selectedClaimsOfficerId.markAsTouched();
      return;
    }

    this.assignmentError.set(null);

    this.assignmentConfirmationOpen.set(
      true
    );
  }

  closeAssignmentConfirmation():
    void {
    if (this.isAssigning()) {
      return;
    }

    this.assignmentConfirmationOpen.set(
      false
    );
  }

  confirmAssignment(): void {
    const currentClaim =
      this.claim();

    const claimsOfficer =
      this.selectedClaimsOfficer();

    if (
      !currentClaim ||
      !claimsOfficer ||
      this.isAssigning()
    ) {
      return;
    }

    this.isAssigning.set(true);
    this.assignmentError.set(null);

    this.claimsApi
      .assignClaimsOfficer(
        currentClaim.claimId,
        {
          claimsOfficerIdentityUserId:
            claimsOfficer.identityUserId
        }
      )
      .pipe(
        finalize(() => {
          this.isAssigning.set(false);
        })
      )
      .subscribe({
        next: updatedClaim => {
          this.claim.set(
            updatedClaim
          );

          this.assignmentConfirmationOpen.set(
            false
          );

          void this.router.navigate([
            '/admin/claims'
          ]);
        },

        error: error => {
          this.assignmentConfirmationOpen.set(
            false
          );

          if (error?.status === 400) {
            this.assignmentError.set(
              this.readErrorMessage(
                error,
                'Select a valid Claims Officer.'
              )
            );

            return;
          }

          if (error?.status === 403) {
            this.assignmentError.set(
              this.readErrorMessage(
                error,
                'You are not permitted to assign this Claim.'
              )
            );

            return;
          }

          if (error?.status === 404) {
            this.assignmentError.set(
              this.readErrorMessage(
                error,
                'The Claim could not be found.'
              )
            );

            return;
          }

          if (error?.status === 409) {
            this.assignmentError.set(
              this.readErrorMessage(
                error,
                'The Claim or selected Claims Officer is no longer eligible for assignment.'
              )
            );

            this.loadPage();

            return;
          }

          if (error?.status === 503) {
            this.assignmentError.set(
              this.readErrorMessage(
                error,
                'Claims assignment is temporarily unavailable.'
              )
            );

            return;
          }

          this.assignmentError.set(
            this.readErrorMessage(
              error,
              'The Claims Officer could not be assigned.'
            )
          );
        }
      });
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

  private loadPage(): void {
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
    this.assignmentError.set(null);

    forkJoin({
      claim:
        this.claimsApi.getAdminClaim(
          claimId
        ),

      claimsOfficers:
        this.claimsApi
          .getEligibleClaimsOfficers()
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: result => {
          this.claim.set(
            result.claim
          );

          this.claimsOfficers.set(
            result.claimsOfficers
          );

          if (
            result.claim
              .assignedClaimsOfficerIdentityUserId
          ) {
            this.selectedClaimsOfficerId
              .setValue(
                result.claim
                  .assignedClaimsOfficerIdentityUserId
              );
          }
        },

        error: error => {
          this.claim.set(null);
          this.claimsOfficers.set([]);

          if (error?.status === 403) {
            this.errorMessage.set(
              'You are not permitted to manage Claim assignments.'
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
                'Claims assignment information is temporarily unavailable.'
              )
            );

            return;
          }

          this.errorMessage.set(
            this.readErrorMessage(
              error,
              'Claim assignment information could not be loaded.'
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
