import {
  DatePipe,
  DecimalPipe
} from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
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
  ClaimType
} from '../../../../core/models/claims/claim.models';
import {
  SubmitClaimRequest
} from '../../../../core/models/claims/agent-claim.models';
import {
  PolicyListItem
} from '../../../../core/models/policy-billing/policy.models';
import {
  PolicyBillingApi
} from '../../../policy-billing/services/policy-billing-api';
import {
  ClaimsApi
} from '../../services/claims-api';

@Component({
  selector: 'app-agent-new-claim',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl:
    './agent-new-claim.html',
  styleUrl:
    './agent-new-claim.css'
})
export class AgentNewClaim
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly claimsApi =
    inject(ClaimsApi);

  private readonly policyBillingApi =
    inject(PolicyBillingApi);

  readonly policies =
    signal<PolicyListItem[]>([]);

  readonly isLoadingPolicies =
    signal(true);

  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly submitError =
    signal<string | null>(null);

  private customerProfileId = '';

  readonly claimTypes:
    {
      value: ClaimType;
      label: string;
    }[] =
    [
      {
        value: 'Accident',
        label: 'Accident'
      },
      {
        value: 'Theft',
        label: 'Theft'
      },
      {
        value: 'Fire',
        label: 'Fire'
      },
      {
        value: 'NaturalDisaster',
        label: 'Natural Disaster'
      },
      {
        value: 'Vandalism',
        label: 'Vandalism'
      },
      {
        value: 'Other',
        label: 'Other'
      }
    ];

  readonly form =
    new FormGroup({
      policyId:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        ),

      claimType:
        new FormControl<ClaimType | ''>(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        ),

      incidentAt:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required
            ]
          }
        ),

      incidentLocation:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.maxLength(250)
            ]
          }
        ),

      incidentDescription:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.maxLength(2000)
            ]
          }
        ),

      estimatedLossAmount:
        new FormControl<number | null>(
          null,
          {
            validators: [
              Validators.required,
              Validators.min(0.01)
            ]
          }
        )
    });

  readonly selectedPolicy =
    computed(() => {
      const policyId =
        this.form.controls.policyId.value;

      if (!policyId) {
        return null;
      }

      return (
        this.policies().find(
          policy =>
            policy.policyId === policyId
        ) ??
        null
      );
    });

  ngOnInit(): void {
    const customerProfileId =
      this.route.snapshot.paramMap.get(
        'customerId'
      );

    if (!customerProfileId) {
      this.isLoadingPolicies.set(false);

      this.errorMessage.set(
        'Customer Profile ID is missing.'
      );

      return;
    }

    this.customerProfileId =
      customerProfileId;

    this.loadPolicies();
  }

  retry(): void {
    this.loadPolicies();
  }

  submit(): void {
    if (
      this.form.invalid ||
      this.isSubmitting()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.customerProfileId) {
      return;
    }

    const value =
      this.form.getRawValue();

    if (
      !value.policyId ||
      !value.claimType ||
      !value.incidentAt ||
      value.estimatedLossAmount === null
    ) {
      return;
    }

    const incidentDate =
      new Date(
        value.incidentAt
      );

    if (
      Number.isNaN(
        incidentDate.getTime()
      )
    ) {
      this.submitError.set(
        'Incident date and time are invalid.'
      );

      return;
    }

    if (
      incidentDate.getTime() >
      Date.now()
    ) {
      this.submitError.set(
        'Incident date and time cannot be in the future.'
      );

      return;
    }

    const request:
      SubmitClaimRequest =
      {
        policyId:
          value.policyId,

        claimType:
          value.claimType,

        incidentAtUtc:
          incidentDate.toISOString(),

        incidentLocation:
          value.incidentLocation.trim(),

        incidentDescription:
          value.incidentDescription.trim(),

        estimatedLossAmount:
          value.estimatedLossAmount
      };

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.claimsApi
      .submitAgentClaim(
        this.customerProfileId,
        request
      )
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: claim => {
          void this.router.navigate([
            '/agent/customers',
            this.customerProfileId,
            'claims',
            claim.claimId
          ]);
        },

        error: error => {
          if (error?.status === 400) {
            this.submitError.set(
              this.readErrorMessage(
                error,
                'The Claim information is invalid.'
              )
            );

            return;
          }

          if (error?.status === 403) {
            this.submitError.set(
              this.readErrorMessage(
                error,
                'You are not permitted to raise a Claim for this Customer or Policy.'
              )
            );

            return;
          }

          if (error?.status === 404) {
            this.submitError.set(
              this.readErrorMessage(
                error,
                'The Customer or selected Policy could not be found.'
              )
            );

            return;
          }

          if (error?.status === 409) {
            this.submitError.set(
              this.readErrorMessage(
                error,
                'The Claim cannot be raised for the selected Policy and incident date.'
              )
            );

            return;
          }

          if (error?.status === 503) {
            this.submitError.set(
              this.readErrorMessage(
                error,
                'Claims processing is temporarily unavailable. Please try again.'
              )
            );

            return;
          }

          this.submitError.set(
            this.readErrorMessage(
              error,
              'The Claim could not be submitted.'
            )
          );
        }
      });
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

  policyStatusClasses(
    status: string
  ): string {
    switch (
      status
        .trim()
        .toLowerCase()
    ) {
      case 'active':
        return 'bg-green-50 text-green-700';

      case 'issued':
        return 'bg-blue-50 text-blue-700';

      case 'expired':
        return 'bg-zinc-100 text-zinc-600';

      case 'cancelled':
        return 'bg-red-50 text-red-700';

      default:
        return 'bg-zinc-100 text-zinc-600';
    }
  }

  private loadPolicies(): void {
    if (!this.customerProfileId) {
      return;
    }

    this.isLoadingPolicies.set(true);
    this.errorMessage.set(null);

    this.policyBillingApi
      .getAgentCustomerPolicies(
        this.customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoadingPolicies.set(false);
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
              this.readErrorMessage(
                error,
                'The Customer could not be found.'
              )
            );

            return;
          }

          if (error?.status === 503) {
            this.errorMessage.set(
              this.readErrorMessage(
                error,
                'Policy information is temporarily unavailable.'
              )
            );

            return;
          }

          this.errorMessage.set(
            this.readErrorMessage(
              error,
              'Customer Policies could not be loaded.'
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
}
