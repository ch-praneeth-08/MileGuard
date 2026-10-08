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
  finalize
} from 'rxjs';

import {
  ClaimsOfficerClaimDetail
} from '../../../../core/models/claims/claims-officer.models';
import {
  ClaimsApi
} from '../../services/claims-api';

@Component({
  selector: 'app-claims-officer-claim-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl:
    './claims-officer-claim-detail.html',
  styleUrl:
    './claims-officer-claim-detail.css'
})
export class ClaimsOfficerClaimDetailPage
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly claimsApi =
    inject(ClaimsApi);

  readonly claim =
    signal<ClaimsOfficerClaimDetail | null>(
      null
    );

  readonly isLoading =
    signal(true);

  readonly isProcessing =
    signal(false);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  readonly actionError =
    signal<string | null>(
      null
    );

  readonly successMessage =
    signal<string | null>(
      null
    );

  readonly activeDialog =
    signal<
      | 'start-review'
      | 'approve'
      | 'reject'
      | 'settle'
      | 'close'
      | null
    >(null);

  readonly approvalReason =
    new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    );

  readonly rejectionReason =
    new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    );

  readonly approvedAmount =
    new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(0.01)
        ]
      }
    );

  ngOnInit(): void {
    this.loadClaim();
  }

  retry(): void {
    this.loadClaim();
  }

  returnToQueue(): void {
    void this.router.navigate([
      '/claims-officer/claims'
    ]);
  }

  openStartReview(): void {
    if (
      this.normalize(
        this.claim()?.status ?? ''
      ) !== 'submitted'
    ) {
      return;
    }

    this.prepareDialog(
      'start-review'
    );
  }

  openApprove(): void {
    if (
      this.normalize(
        this.claim()?.status ?? ''
      ) !== 'inreview'
    ) {
      return;
    }

    this.approvalReason.reset();

    this.prepareDialog(
      'approve'
    );
  }

  openReject(): void {
    if (
      this.normalize(
        this.claim()?.status ?? ''
      ) !== 'inreview'
    ) {
      return;
    }

    this.rejectionReason.reset();

    this.prepareDialog(
      'reject'
    );
  }

  openSettle(): void {
    if (
      this.normalize(
        this.claim()?.status ?? ''
      ) !== 'approved'
    ) {
      return;
    }

    this.approvedAmount.reset();

    this.prepareDialog(
      'settle'
    );
  }

  openClose(): void {
    const status =
      this.normalize(
        this.claim()?.status ?? ''
      );

    if (
      status !== 'settled' &&
      status !== 'rejected'
    ) {
      return;
    }

    this.prepareDialog(
      'close'
    );
  }

  closeDialog(): void {
    if (this.isProcessing()) {
      return;
    }

    this.activeDialog.set(null);
  }

  confirmStartReview(): void {
    const currentClaim =
      this.claim();

    if (
      !currentClaim ||
      this.isProcessing()
    ) {
      return;
    }

    this.beginProcessing();

    this.claimsApi
      .startClaimReview(
        currentClaim.claimId
      )
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
        })
      )
      .subscribe({
        next: claim => {
          this.completeAction(
            claim,
            'Claim review has started.'
          );
        },

        error: error => {
          this.handleActionError(
            error,
            'The Claim review could not be started.'
          );
        }
      });
  }

  confirmApprove(): void {
    const currentClaim =
      this.claim();

    if (
      !currentClaim ||
      this.isProcessing()
    ) {
      return;
    }

    if (this.approvalReason.invalid) {
      this.approvalReason.markAsTouched();
      return;
    }

    const decisionReason =
      this.approvalReason.value.trim();

    if (!decisionReason) {
      this.approvalReason.markAsTouched();
      return;
    }

    this.beginProcessing();

    this.claimsApi
      .approveClaim(
        currentClaim.claimId,
        {
          decisionReason
        }
      )
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
        })
      )
      .subscribe({
        next: claim => {
          this.completeAction(
            claim,
            'The Claim has been approved.'
          );
        },

        error: error => {
          this.handleActionError(
            error,
            'The Claim could not be approved.'
          );
        }
      });
  }

  confirmReject(): void {
    const currentClaim =
      this.claim();

    if (
      !currentClaim ||
      this.isProcessing()
    ) {
      return;
    }

    if (this.rejectionReason.invalid) {
      this.rejectionReason.markAsTouched();
      return;
    }

    const rejectionReason =
      this.rejectionReason.value.trim();

    if (!rejectionReason) {
      this.rejectionReason.markAsTouched();
      return;
    }

    this.beginProcessing();

    this.claimsApi
      .rejectClaim(
        currentClaim.claimId,
        {
          rejectionReason
        }
      )
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
        })
      )
      .subscribe({
        next: claim => {
          this.completeAction(
            claim,
            'The Claim has been rejected.'
          );
        },

        error: error => {
          this.handleActionError(
            error,
            'The Claim could not be rejected.'
          );
        }
      });
  }

  confirmSettle(): void {
    const currentClaim =
      this.claim();

    if (
      !currentClaim ||
      this.isProcessing()
    ) {
      return;
    }

    if (
      this.approvedAmount.invalid ||
      this.approvedAmount.value === null
    ) {
      this.approvedAmount.markAsTouched();
      return;
    }

    this.beginProcessing();

    this.claimsApi
      .settleClaim(
        currentClaim.claimId,
        {
          approvedAmount:
            this.approvedAmount.value
        }
      )
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
        })
      )
      .subscribe({
        next: claim => {
          this.completeAction(
            claim,
            'The Claim settlement has been recorded.'
          );
        },

        error: error => {
          this.handleActionError(
            error,
            'The Claim could not be settled.'
          );
        }
      });
  }

  confirmClose(): void {
    const currentClaim =
      this.claim();

    if (
      !currentClaim ||
      this.isProcessing()
    ) {
      return;
    }

    this.beginProcessing();

    this.claimsApi
      .closeClaim(
        currentClaim.claimId
      )
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
        })
      )
      .subscribe({
        next: claim => {
          this.completeAction(
            claim,
            'The Claim has been closed.'
          );
        },

        error: error => {
          this.handleActionError(
            error,
            'The Claim could not be closed.'
          );
        }
      });
  }

  isSubmitted(): boolean {
    return (
      this.normalize(
        this.claim()?.status ?? ''
      ) === 'submitted'
    );
  }

  isInReview(): boolean {
    return (
      this.normalize(
        this.claim()?.status ?? ''
      ) === 'inreview'
    );
  }

  isApproved(): boolean {
    return (
      this.normalize(
        this.claim()?.status ?? ''
      ) === 'approved'
    );
  }

  isRejected(): boolean {
    return (
      this.normalize(
        this.claim()?.status ?? ''
      ) === 'rejected'
    );
  }

  isSettled(): boolean {
    return (
      this.normalize(
        this.claim()?.status ?? ''
      ) === 'settled'
    );
  }

  isClosed(): boolean {
    return (
      this.normalize(
        this.claim()?.status ?? ''
      ) === 'closed'
    );
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
    this.actionError.set(null);
    this.successMessage.set(null);

    this.claimsApi
      .getClaimsOfficerClaim(
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
              this.readErrorMessage(
                error,
                'This Claim is not assigned to your Claims Officer account.'
              )
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

  private prepareDialog(
    dialog:
      | 'start-review'
      | 'approve'
      | 'reject'
      | 'settle'
      | 'close'
  ): void {
    this.actionError.set(null);
    this.successMessage.set(null);

    this.activeDialog.set(
      dialog
    );
  }

  private beginProcessing(): void {
    this.isProcessing.set(true);
    this.actionError.set(null);
    this.successMessage.set(null);
  }

  private completeAction(
    claim: ClaimsOfficerClaimDetail,
    message: string
  ): void {
    this.claim.set(
      claim
    );

    this.activeDialog.set(null);

    this.successMessage.set(
      message
    );
  }

  private handleActionError(
    error: any,
    fallback: string
  ): void {
    this.activeDialog.set(null);

    if (error?.status === 400) {
      this.actionError.set(
        this.readErrorMessage(
          error,
          fallback
        )
      );

      return;
    }

    if (error?.status === 403) {
      this.actionError.set(
        this.readErrorMessage(
          error,
          'You are not permitted to perform this Claim action.'
        )
      );

      return;
    }

    if (error?.status === 404) {
      this.actionError.set(
        this.readErrorMessage(
          error,
          'The Claim could not be found.'
        )
      );

      return;
    }

    if (error?.status === 409) {
      this.actionError.set(
        this.readErrorMessage(
          error,
          'The Claim is no longer in a state that permits this action.'
        )
      );

      return;
    }

    if (error?.status === 503) {
      this.actionError.set(
        this.readErrorMessage(
          error,
          'Claims processing is temporarily unavailable.'
        )
      );

      return;
    }

    this.actionError.set(
      this.readErrorMessage(
        error,
        fallback
      )
    );
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

    const errors =
      error?.error?.errors;

    if (
      errors &&
      typeof errors === 'object'
    ) {
      const messages =
        Object.values(errors)
          .flatMap(value =>
            Array.isArray(value)
              ? value
              : []
          )
          .filter(
            value =>
              typeof value === 'string'
          );

      if (messages.length > 0) {
        return messages.join(' ');
      }
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
