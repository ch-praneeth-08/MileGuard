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
  forkJoin,
  finalize
} from 'rxjs';

import {
  PolicyDetail,
  PolicyPayments
} from '../../../../core/models/policy-billing/policy.models';
import {
  AgentPolicyRenewal,
  StartRenewalResponse
} from '../../../../core/models/policy-billing/renewal.models';
import {
  PolicyBillingApi
} from '../../services/policy-billing-api';

@Component({
  selector: 'app-agent-policy-detail',
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './agent-policy-detail.html',
  styleUrl: './agent-policy-detail.css'
})
export class AgentPolicyDetail
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly policyBillingApi =
    inject(PolicyBillingApi);

  private customerProfileId:
    string | null = null;

  private policyId:
    string | null = null;
readonly renewal =
  signal<AgentPolicyRenewal | null>(
    null
  );

readonly startedRenewal =
  signal<StartRenewalResponse | null>(
    null
  );

readonly isLoadingRenewal =
  signal(false);

readonly isStartingRenewal =
  signal(false);

readonly renewalError =
  signal<string | null>(
    null
  );

readonly renewalConfirmationOpen =
  signal(false);
  readonly policy =
    signal<PolicyDetail | null>(null);

  readonly payments =
    signal<PolicyPayments | null>(null);

  readonly isLoading =
    signal(true);

  readonly isDownloading =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly actionError =
    signal<string | null>(null);

  readonly successMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    this.customerProfileId =
      this.route.snapshot.paramMap.get(
        'customerId'
      );

    this.policyId =
      this.route.snapshot.paramMap.get(
        'policyId'
      );

    if (
      !this.customerProfileId ||
      !this.policyId
    ) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    this.loadPolicy();
  }

  retry(): void {
    this.loadPolicy();
  }

  backToPolicies(): void {
    if (!this.customerProfileId) {
      void this.router.navigate([
        '/agent/customers'
      ]);

      return;
    }

    void this.router.navigate([
      '/agent/customers',
      this.customerProfileId,
      'policies'
    ]);
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

  downloadDocument(): void {
    const currentPolicy =
      this.policy();

    if (
      !currentPolicy ||
      !currentPolicy.hasDocument ||
      this.isDownloading()
    ) {
      return;
    }

    this.actionError.set(null);
    this.successMessage.set(null);
    this.isDownloading.set(true);

    this.policyBillingApi
      .getAgentPolicyDocument(
        currentPolicy.policyId
      )
      .pipe(
        finalize(() => {
          this.isDownloading.set(false);
        })
      )
      .subscribe({
        next: file => {
          const objectUrl =
            URL.createObjectURL(file);

          const anchor =
            document.createElement('a');

          anchor.href = objectUrl;

          anchor.download =
            `${currentPolicy.policyNumber}.pdf`;

          document.body.appendChild(
            anchor
          );

          anchor.click();
          anchor.remove();

          URL.revokeObjectURL(
            objectUrl
          );

          this.successMessage.set(
            'Policy document downloaded successfully.'
          );
        },

        error: error => {
          this.actionError.set(
            error?.error?.message ??
            'The Policy document could not be downloaded.'
          );
        }
      });
  }

  statusClasses(
    status: string
  ): string {
    switch (
      status
        .trim()
        .toLowerCase()
    ) {
      case 'issued':
        return 'bg-blue-50 text-blue-700';

      case 'active':
        return 'bg-green-50 text-green-700';

      case 'expired':
        return 'bg-zinc-100 text-zinc-600';

      case 'cancelled':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  installmentClasses(
    status: string
  ): string {
    switch (
      status
        .trim()
        .toLowerCase()
    ) {
      case 'paid':
        return 'bg-green-50 text-green-700';

      case 'due':
        return 'bg-blue-50 text-blue-700';

      case 'overdue':
        return 'bg-red-50 text-red-700';

      case 'upcoming':
        return 'bg-zinc-100 text-zinc-600';

      case 'nolongerdue':
        return 'bg-zinc-100 text-zinc-500';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  private loadPolicy(): void {
    if (!this.policyId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.actionError.set(null);
    this.successMessage.set(null);

    forkJoin({
      policy:
        this.policyBillingApi
          .getAgentPolicy(
            this.policyId
          ),

      payments:
        this.policyBillingApi
          .getAgentPolicyPayments(
            this.policyId
          )
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: result => {
          if (
            this.customerProfileId &&
            result.policy.customerProfileId !==
              this.customerProfileId
          ) {
            this.policy.set(null);
            this.payments.set(null);

            this.errorMessage.set(
              'This Policy does not belong to the current Customer workspace.'
            );

            return;
          }

          this.policy.set(
            result.policy
          );

          this.payments.set(
            result.payments
          );
          this.loadRenewal();
        },
        error: error => {
          this.policy.set(null);
          this.payments.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This Policy is not available to your Agent account.'
            );
            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              error?.error?.message ??
              'The Policy could not be found.'
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
            'The Policy could not be loaded. Please try again.'
          );
        }
      });
  }
  openRenewalConfirmation(): void {
  const currentRenewal =
    this.renewal();

  if (
    !currentRenewal ||
    !currentRenewal.renewalEligible ||
    currentRenewal.renewalStatus !==
      'Eligible' ||
    this.isStartingRenewal()
  ) {
    return;
  }

  this.actionError.set(null);
  this.successMessage.set(null);
  this.renewalError.set(null);

  this.renewalConfirmationOpen.set(
    true
  );
}

closeRenewalConfirmation(): void {
  if (this.isStartingRenewal()) {
    return;
  }

  this.renewalConfirmationOpen.set(
    false
  );
}

startRenewal(): void {
  const currentPolicy =
    this.policy();

  const currentRenewal =
    this.renewal();

  if (
    !currentPolicy ||
    !currentRenewal ||
    !currentRenewal.renewalEligible ||
    currentRenewal.renewalStatus !==
      'Eligible' ||
    this.isStartingRenewal()
  ) {
    return;
  }

  this.actionError.set(null);
  this.successMessage.set(null);
  this.renewalError.set(null);

  this.isStartingRenewal.set(
    true
  );

  this.policyBillingApi
    .startAgentRenewal(
      currentPolicy.policyId
    )
    .pipe(
      finalize(() => {
        this.isStartingRenewal.set(
          false
        );
      })
    )
    .subscribe({
      next: response => {
        this.startedRenewal.set(
          response
        );

        this.renewalConfirmationOpen.set(
          false
        );

        this.successMessage.set(
          'Policy renewal was started successfully.'
        );

        this.loadRenewal();
      },

      error: error => {
        this.renewalConfirmationOpen.set(
          false
        );

        if (error?.status === 403) {
          this.renewalError.set(
            'You are not permitted to start renewal for this Policy.'
          );

          return;
        }

        if (error?.status === 404) {
          this.renewalError.set(
            error?.error?.message ??
            'The Policy could not be found.'
          );

          return;
        }

        if (error?.status === 409) {
          this.renewalError.set(
            error?.error?.message ??
            'The Policy is no longer eligible to start renewal. Refresh its current renewal status.'
          );

          this.loadRenewal();

          return;
        }

        if (error?.status === 503) {
          this.renewalError.set(
            error?.error?.message ??
            'Renewal is temporarily unavailable. Please try again.'
          );

          return;
        }

        this.renewalError.set(
          error?.error?.message ??
          'Policy renewal could not be started.'
        );
      }
    });
}

renewalStatusClasses(
  status: string
): string {
  switch (
    status
      .trim()
      .toLowerCase()
  ) {
    case 'eligible':
      return 'bg-green-50 text-green-700';

    case 'started':
    case 'quoteinprogress':
      return 'bg-blue-50 text-blue-700';

    case 'policyissued':
      return 'bg-green-50 text-green-700';

    case 'tooearly':
      return 'bg-amber-50 text-amber-700';

    case 'cancelled':
      return 'bg-red-50 text-red-700';

    case 'notrenewable':
      return 'bg-zinc-100 text-zinc-600';

    default:
      return 'bg-zinc-100 text-zinc-600';
  }
}

renewalStatusLabel(
  status: string
): string {
  switch (
    status
      .trim()
      .toLowerCase()
  ) {
    case 'eligible':
      return 'Eligible';

    case 'tooearly':
      return 'Too Early';

    case 'started':
      return 'Renewal Started';

    case 'quoteinprogress':
      return 'Quote In Progress';

    case 'policyissued':
      return 'Renewed Policy Issued';

    case 'cancelled':
      return 'Cancelled';

    case 'notrenewable':
      return 'Not Renewable';

    default:
      return status;
  }
}
private loadRenewal(): void {
  const currentPolicy =
    this.policy();

  if (
    !currentPolicy ||
    this.isLoadingRenewal()
  ) {
    return;
  }

  this.isLoadingRenewal.set(
    true
  );

  this.renewalError.set(
    null
  );

  this.policyBillingApi
    .getAgentPolicyRenewal(
      currentPolicy.policyId
    )
    .pipe(
      finalize(() => {
        this.isLoadingRenewal.set(
          false
        );
      })
    )
    .subscribe({
      next: renewal => {
        this.renewal.set(
          renewal
        );
      },

      error: error => {
        this.renewal.set(null);

        if (error?.status === 403) {
          this.renewalError.set(
            'Renewal information is not available to your Agent account.'
          );

          return;
        }

        if (error?.status === 404) {
          this.renewalError.set(
            error?.error?.message ??
            'Renewal information could not be found.'
          );

          return;
        }

        if (error?.status === 503) {
          this.renewalError.set(
            error?.error?.message ??
            'Renewal information is temporarily unavailable.'
          );

          return;
        }

        this.renewalError.set(
          error?.error?.message ??
          'Renewal information could not be loaded.'
        );
      }
    });
}
renewalMessage(
  renewal: AgentPolicyRenewal
): string {
  switch (renewal.renewalStatus) {
    case 'Eligible':
      return 'This Policy is currently within its renewal window and a renewal may be started.';

    case 'TooEarly':
      return 'The renewal window has not opened yet.';

    case 'Started':
      return 'Renewal has been started for this Policy.';

    case 'QuoteInProgress':
      return 'A renewal Quote is currently in progress.';

    case 'PolicyIssued':
      return 'The renewal lifecycle has completed and the renewed Policy has been issued.';

    case 'Cancelled':
      return 'The renewal was cancelled.';

    case 'NotRenewable':
      return 'This Policy is not currently renewable.';
  }
}
}
