import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { finalize } from 'rxjs';

import {
  AssignmentReviewCustomer,
  EligibleAgent
} from '../../../../core/models/agent-assignment.models';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

@Component({
  selector: 'app-admin-assignment-review',
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './admin-assignment-review.html',
  styleUrl: './admin-assignment-review.css'
})
export class AdminAssignmentReview implements OnInit {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  readonly customer =
    signal<AssignmentReviewCustomer | null>(
      null
    );

  readonly agents =
    signal<EligibleAgent[]>([]);

  readonly isLoadingCustomer =
    signal(true);

  readonly isLoadingAgents =
    signal(true);

  readonly isAssigning =
    signal(false);

  readonly customerErrorMessage =
    signal<string | null>(null);

  readonly agentsErrorMessage =
    signal<string | null>(null);

  readonly assignmentErrorMessage =
    signal<string | null>(null);

  readonly showConfirmation =
    signal(false);

  readonly successMessage =
    signal<string | null>(null);

  readonly form =
    this.formBuilder.nonNullable.group({
      agentIdentityUserId: [
        '',
        Validators.required
      ]
    });

  ngOnInit(): void {
    const customerProfileId =
      this.getCustomerProfileId();

    if (!customerProfileId) {
      this.back();
      return;
    }

    this.loadCustomer(
      customerProfileId
    );

    this.loadEligibleAgents();
  }

  selectAgent(
    agent: EligibleAgent
  ): void {
    this.form.controls.agentIdentityUserId
      .setValue(agent.id);

    this.assignmentErrorMessage.set(null);
  }

  selectedAgent():
    EligibleAgent | undefined {
    const selectedId =
      this.form.controls
        .agentIdentityUserId.value;

    return this.agents().find(
      agent =>
        agent.id === selectedId
    );
  }

  openConfirmation(): void {
    if (
      this.form.invalid ||
      this.isAssigning()
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.assignmentErrorMessage.set(null);

    this.showConfirmation.set(true);
  }

  cancelConfirmation(): void {
    this.showConfirmation.set(false);
  }

  confirmAssignment(): void {
    const customer =
      this.customer();

    if (
      !customer ||
      this.form.invalid ||
      this.isAssigning()
    ) {
      return;
    }

    this.showConfirmation.set(false);

    this.assignmentErrorMessage.set(null);

    this.isAssigning.set(true);

    this.customerVehicleApi
      .assignAgent(
        customer.customerProfileId,
        {
          agentIdentityUserId:
            this.form.controls
              .agentIdentityUserId
              .value
        }
      )
      .pipe(
        finalize(() => {
          this.isAssigning.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.successMessage.set(
            'Agent assigned successfully.'
          );

          setTimeout(() => {
            void this.router.navigate([
              '/admin/assignments/customers'
            ]);
          }, 800);
        },

        error: error => {
          if (error?.status === 409) {
            this.assignmentErrorMessage.set(
              error?.error?.message ??
              'The assignment could not be completed because the customer or Agent state changed.'
            );

            return;
          }

          if (error?.status === 503) {
            this.assignmentErrorMessage.set(
              'Identity service is currently unavailable. No assignment was created. Please try again.'
            );

            return;
          }

          if (error?.status === 404) {
            this.assignmentErrorMessage.set(
              'The customer could not be found.'
            );

            return;
          }

          this.assignmentErrorMessage.set(
            'Agent assignment could not be completed. Please try again.'
          );
        }
      });
  }

  retryCustomer(): void {
    const customerProfileId =
      this.getCustomerProfileId();

    if (!customerProfileId) {
      this.back();
      return;
    }

    this.loadCustomer(
      customerProfileId
    );
  }

  retryAgents(): void {
    this.loadEligibleAgents();
  }

  back(): void {
    void this.router.navigate([
      '/admin/assignments/customers'
    ]);
  }

  private getCustomerProfileId():
    string | null {
    return this.route.snapshot
      .paramMap
      .get('id');
  }

  private loadCustomer(
    customerProfileId: string
  ): void {
    this.customerErrorMessage.set(null);
    this.isLoadingCustomer.set(true);

    this.customerVehicleApi
      .getCustomerForAssignment(
        customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoadingCustomer.set(
            false
          );
        })
      )
      .subscribe({
        next: customer => {
          if (customer.isAssigned) {
            this.customer.set(null);

            this.customerErrorMessage.set(
              'This customer already has a permanent Agent assignment.'
            );

            return;
          }

          this.customer.set(customer);
        },

        error: error => {
          this.customer.set(null);

          if (error?.status === 404) {
            this.customerErrorMessage.set(
              'The customer could not be found.'
            );

            return;
          }

          if (error?.status === 403) {
            this.customerErrorMessage.set(
              'You are not authorized to review this customer.'
            );

            return;
          }

          this.customerErrorMessage.set(
            'Customer information could not be loaded. Please try again.'
          );
        }
      });
  }

  private loadEligibleAgents(): void {
    this.agentsErrorMessage.set(null);
    this.isLoadingAgents.set(true);

    this.customerVehicleApi
      .getEligibleAgents()
      .pipe(
        finalize(() => {
          this.isLoadingAgents.set(
            false
          );
        })
      )
      .subscribe({
        next: agents => {
          this.agents.set(agents);

          const selectedId =
            this.form.controls
              .agentIdentityUserId.value;

          if (
            selectedId &&
            !agents.some(
              agent =>
                agent.id === selectedId
            )
          ) {
            this.form.controls
              .agentIdentityUserId
              .reset();
          }
        },

        error: error => {
          this.agents.set([]);

          if (error?.status === 503) {
            this.agentsErrorMessage.set(
              'Identity service is currently unavailable. Eligible Agents could not be loaded.'
            );

            return;
          }

          if (error?.status === 404) {
            this.agentsErrorMessage.set(
              'The eligible Agent endpoint could not be found.'
            );

            return;
          }

          if (error?.status === 403) {
            this.agentsErrorMessage.set(
              'You are not authorized to view eligible Agents.'
            );

            return;
          }

          this.agentsErrorMessage.set(
            'Eligible Agents could not be loaded. Please try again.'
          );
        }
      });
  }
}
