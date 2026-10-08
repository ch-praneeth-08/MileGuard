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
  AgentCustomerWorkspace as AgentCustomerWorkspaceModel
} from '../../../../core/models/agent-customer.models';
import {
  CustomerReadiness
} from '../../../../core/models/customer-readiness.models';
import {
  Driver
} from '../../../../core/models/driver.models';
import {
  Vehicle
} from '../../../../core/models/vehicle.models';
import {
  CustomerVehicleApi
} from '../../services/customer-vehicle-api';

type WorkspaceTab =
  | 'overview'
  | 'profile'
  | 'driver'
  | 'vehicles'
  | 'quotes';

type ReadinessBlockingStage =
  | 'profile'
  | 'agent'
  | 'driver'
  | 'vehicle'
  | 'complete'
  | 'loading';

@Component({
  selector: 'app-agent-customer-workspace',
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl:
    './agent-customer-workspace.html',
  styleUrl:
    './agent-customer-workspace.css'
})
export class AgentCustomerWorkspace
  implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly customerVehicleApi =
    inject(CustomerVehicleApi);

  /*
   * =====================================================
   * CUSTOMER
   * =====================================================
   */

  readonly customer =
    signal<AgentCustomerWorkspaceModel | null>(
      null
    );

  /*
   * =====================================================
   * BACKEND READINESS
   * =====================================================
   */

  readonly readiness =
    signal<CustomerReadiness | null>(
      null
    );

  readonly isLoadingReadiness =
    signal(false);

  readonly readinessLoaded =
    signal(false);

  readonly readinessErrorMessage =
    signal<string | null>(
      null
    );

  /*
   * =====================================================
   * DRIVER
   * =====================================================
   */

  readonly driver =
    signal<Driver | null>(
      null
    );

  readonly isLoadingDriver =
    signal(false);

  readonly driverLoaded =
    signal(false);

  readonly isSavingDriver =
    signal(false);

  readonly isEditingDriver =
    signal(false);

  readonly driverErrorMessage =
    signal<string | null>(
      null
    );

  readonly driverSuccessMessage =
    signal<string | null>(
      null
    );

  /*
   * =====================================================
   * VEHICLES
   * =====================================================
   */

  readonly vehicles =
    signal<Vehicle[]>(
      []
    );

  readonly isLoadingVehicles =
    signal(false);

  readonly vehiclesLoaded =
    signal(false);

  readonly vehiclesErrorMessage =
    signal<string | null>(
      null
    );

  /*
   * =====================================================
   * WORKSPACE
   * =====================================================
   */

  readonly activeTab =
    signal<WorkspaceTab>(
      'overview'
    );

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(
      null
    );

  /*
   * =====================================================
   * DRIVER FORM
   * =====================================================
   */

  readonly driverForm =
    this.formBuilder.nonNullable.group({
      licenceNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      licenceState: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      licenceIssueDate: [
        '',
        Validators.required
      ],

      licenceExpiryDate: [
        '',
        Validators.required
      ]
    });

  ngOnInit(): void {
    this.loadWorkspace();
  }

  /*
   * =====================================================
   * WORKSPACE NAVIGATION
   * =====================================================
   */

  selectTab(
  tab: WorkspaceTab
): void {
  this.activeTab.set(tab);

  if (
    tab === 'driver' &&
    !this.driverLoaded()
  ) {
    this.loadDriver();
  }

  if (
    tab === 'vehicles' &&
    !this.vehiclesLoaded()
  ) {
    this.loadVehicles();
  }

  if (tab === 'quotes') {
    this.openQuotes();
  }
}

openQuotes(): void {
  const currentCustomer =
    this.customer();

  if (!currentCustomer) {
    return;
  }

  void this.router.navigate([
    '/agent/customers',
    currentCustomer.customerProfileId,
    'quotes'
  ]);
}
openPolicies(): void {
  const currentCustomer =
    this.customer();

  if (!currentCustomer) {
    return;
  }

  void this.router.navigate([
    '/agent/customers',
    currentCustomer.customerProfileId,
    'policies'
  ]);
}
openClaims(): void {
  const currentCustomer =
    this.customer();

  if (!currentCustomer) {
    return;
  }

  void this.router.navigate([
    '/agent/customers',
    currentCustomer.customerProfileId,
    'claims'
  ]);
}
  backToCustomers(): void {
    void this.router.navigate([
      '/agent/customers'
    ]);
  }

  retryWorkspace(): void {
    this.loadWorkspace();
  }

  /*
   * =====================================================
   * CUSTOMER DISPLAY
   * =====================================================
   */

  customerDisplayName(): string {
    const currentCustomer =
      this.customer();

    if (!currentCustomer) {
      return 'Customer';
    }

    const nameParts = [
      currentCustomer.firstName,
      currentCustomer.lastName
    ];

    const fullName =
      nameParts
        .filter(
          value =>
            !!value?.trim()
        )
        .join(' ')
        .trim();

    return fullName || 'Customer';
  }

  customerInitials(): string {
    const currentCustomer =
      this.customer();

    if (!currentCustomer) {
      return 'CU';
    }

    const firstInitial =
      currentCustomer.firstName
        ?.trim()
        .charAt(0)
        .toUpperCase() ?? '';

    const lastInitial =
      currentCustomer.lastName
        ?.trim()
        .charAt(0)
        .toUpperCase() ?? '';

    const initials =
      `${firstInitial}${lastInitial}`;

    return initials || 'CU';
  }

  /*
   * =====================================================
   * AUTHORITATIVE READINESS DISPLAY
   * =====================================================
   */

  blockingStage():
    ReadinessBlockingStage {
    if (
      this.isLoadingReadiness() ||
      !this.readinessLoaded()
    ) {
      return 'loading';
    }

    const currentReadiness =
      this.readiness();

    if (!currentReadiness) {
      return 'loading';
    }

    if (
      !currentReadiness
        .profile
        .complete
    ) {
      return 'profile';
    }

    if (
      !currentReadiness
        .agent
        .complete
    ) {
      return 'agent';
    }

    if (
      !currentReadiness
        .driver
        .complete
    ) {
      return 'driver';
    }

    if (
      !currentReadiness
        .vehicle
        .complete
    ) {
      return 'vehicle';
    }

    return 'complete';
  }

  readyForQuote(): boolean {
    return (
      this.readiness()
        ?.readyForQuote ??
      false
    );
  }

  profileStageComplete(): boolean {
    return (
      this.readiness()
        ?.profile
        .complete ??
      false
    );
  }

  agentStageComplete(): boolean {
    return (
      this.readiness()
        ?.agent
        .complete ??
      false
    );
  }

  driverStageComplete(): boolean {
    return (
      this.readiness()
        ?.driver
        .complete ??
      false
    );
  }

  vehicleStageComplete(): boolean {
    return (
      this.readiness()
        ?.vehicle
        .complete ??
      false
    );
  }

  profileStageIssues(): string[] {
    return (
      this.readiness()
        ?.profile
        .issues ??
      []
    );
  }

  agentStageIssues(): string[] {
    return (
      this.readiness()
        ?.agent
        .issues ??
      []
    );
  }

  driverStageIssues(): string[] {
    return (
      this.readiness()
        ?.driver
        .issues ??
      []
    );
  }

  vehicleStageIssues(): string[] {
    return (
      this.readiness()
        ?.vehicle
        .issues ??
      []
    );
  }

  retryReadiness(): void {
    this.loadReadiness();
  }

  /*
   * =====================================================
   * DRIVER
   * =====================================================
   */

  startDriverForm(): void {
    const currentDriver =
      this.driver();

    this.driverErrorMessage.set(
      null
    );

    this.driverSuccessMessage.set(
      null
    );

    if (currentDriver) {
      this.driverForm.setValue({
        licenceNumber:
          currentDriver.licenceNumber,

        licenceState:
          currentDriver.licenceState,

        licenceIssueDate:
          currentDriver.licenceIssueDate,

        licenceExpiryDate:
          currentDriver.licenceExpiryDate
      });
    } else {
      this.driverForm.reset();
    }

    this.isEditingDriver.set(
      true
    );
  }

  cancelDriverForm(): void {
    this.driverErrorMessage.set(
      null
    );

    this.isEditingDriver.set(
      false
    );

    this.driverForm.reset();
  }

  saveDriver(): void {
    const currentCustomer =
      this.customer();

    if (
      !currentCustomer ||
      this.driverForm.invalid ||
      this.isSavingDriver()
    ) {
      this.driverForm
        .markAllAsTouched();

      return;
    }

    const values =
      this.driverForm.getRawValue();

    if (
      values.licenceExpiryDate <=
      values.licenceIssueDate
    ) {
      this.driverErrorMessage.set(
        'Licence expiry date must be later than the issue date.'
      );

      return;
    }

    this.driverErrorMessage.set(
      null
    );

    this.driverSuccessMessage.set(
      null
    );

    this.isSavingDriver.set(
      true
    );

    this.customerVehicleApi
      .saveAgentDriver(
        currentCustomer
          .customerProfileId,
        {
          licenceNumber:
            values
              .licenceNumber
              .trim(),

          licenceState:
            values
              .licenceState
              .trim(),

          licenceIssueDate:
            values
              .licenceIssueDate,

          licenceExpiryDate:
            values
              .licenceExpiryDate
        }
      )
      .pipe(
        finalize(() => {
          this.isSavingDriver.set(
            false
          );
        })
      )
      .subscribe({
        next: savedDriver => {
          this.driver.set(
            savedDriver
          );

          this.driverLoaded.set(
            true
          );

          this.isEditingDriver.set(
            false
          );

          this.driverForm.reset();

          this.driverSuccessMessage.set(
            'Primary Driver saved successfully.'
          );

          /*
           * Driver readiness may have changed.
           *
           * Refresh the authoritative backend readiness
           * immediately after the Driver write.
           */
          this.loadReadiness();
        },

        error: error => {
          if (error?.status === 409) {
            this.driverErrorMessage.set(
              error?.error?.message ??
              'Licence Number is already in use.'
            );

            return;
          }

          if (error?.status === 403) {
            this.driverErrorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.driverErrorMessage.set(
              'The Customer could not be found.'
            );

            return;
          }

          this.driverErrorMessage.set(
            error?.error?.message ??
            'Primary Driver could not be saved. Please try again.'
          );
        }
      });
  }

  retryDriver(): void {
    this.loadDriver();
  }

  /*
   * =====================================================
   * VEHICLES
   * =====================================================
   */

  addVehicle(): void {
    const currentCustomer =
      this.customer();

    if (!currentCustomer) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      currentCustomer
        .customerProfileId,
      'vehicles',
      'new'
    ]);
  }

  openVehicle(
    vehicle: Vehicle
  ): void {
    const currentCustomer =
      this.customer();

    if (!currentCustomer) {
      return;
    }

    void this.router.navigate([
      '/agent/customers',
      currentCustomer
        .customerProfileId,
      'vehicles',
      vehicle.id
    ]);
  }

  retryVehicles(): void {
    this.loadVehicles();
  }

  /*
   * These helpers remain useful for Garage presentation.
   *
   * They are no longer used to calculate the overall
   * Customer readiness journey.
   */
  readyVehicleCount(): number {
    return this.vehicles()
      .filter(
        vehicle =>
          vehicle.ready
      )
      .length;
  }

  /*
   * =====================================================
   * WORKSPACE DATA LOADING
   * =====================================================
   */

  private loadWorkspace(): void {
    const customerProfileId =
      this.getCustomerProfileId();

    if (!customerProfileId) {
      this.backToCustomers();
      return;
    }

    this.errorMessage.set(null);

    this.isLoading.set(true);

    this.customerVehicleApi
      .getAgentCustomer(
        customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(
            false
          );
        })
      )
      .subscribe({
        next: workspaceCustomer => {
          this.customer.set(
            workspaceCustomer
          );

          /*
           * Load the actual workspace resources for their
           * corresponding tabs.
           */
          this.loadDriver();

          this.loadVehicles();

          /*
           * Load authoritative overall readiness
           * independently.
           */
          this.loadReadiness();
        },

        error: error => {
          this.customer.set(null);

          this.readiness.set(null);

          if (error?.status === 403) {
            this.errorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.errorMessage.set(
              'The Customer could not be found.'
            );

            return;
          }

          this.errorMessage.set(
            'The Customer workspace could not be loaded. Please try again.'
          );
        }
      });
  }

  /*
   * =====================================================
   * READINESS LOADING
   * =====================================================
   */

  private loadReadiness(): void {
    const currentCustomer =
      this.customer();

    if (
      !currentCustomer ||
      this.isLoadingReadiness()
    ) {
      return;
    }

    this.readinessErrorMessage.set(
      null
    );

    this.isLoadingReadiness.set(
      true
    );

    this.customerVehicleApi
      .getAgentCustomerReadiness(
        currentCustomer
          .customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoadingReadiness.set(
            false
          );

          this.readinessLoaded.set(
            true
          );
        })
      )
      .subscribe({
        next: customerReadiness => {
          this.readiness.set(
            customerReadiness
          );
        },

        error: error => {
          this.readiness.set(null);

          if (error?.status === 403) {
            this.readinessErrorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.readinessErrorMessage.set(
              'Customer readiness could not be found.'
            );

            return;
          }

          this.readinessErrorMessage.set(
            'Customer readiness could not be loaded. Please try again.'
          );
        }
      });
  }

  /*
   * =====================================================
   * DRIVER LOADING
   * =====================================================
   */

  private loadDriver(): void {
    const currentCustomer =
      this.customer();

    if (
      !currentCustomer ||
      this.isLoadingDriver()
    ) {
      return;
    }

    this.driverErrorMessage.set(
      null
    );

    this.isLoadingDriver.set(
      true
    );

    this.customerVehicleApi
      .getAgentDriver(
        currentCustomer
          .customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoadingDriver.set(
            false
          );

          this.driverLoaded.set(
            true
          );
        })
      )
      .subscribe({
        next: currentDriver => {
          this.driver.set(
            currentDriver
          );
        },

        error: error => {
          /*
           * 404 means the Customer simply does not yet
           * have a Primary Driver.
           */
          if (error?.status === 404) {
            this.driver.set(null);
            return;
          }

          this.driver.set(null);

          if (error?.status === 403) {
            this.driverErrorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          this.driverErrorMessage.set(
            'Primary Driver information could not be loaded.'
          );
        }
      });
  }

  /*
   * =====================================================
   * VEHICLE LOADING
   * =====================================================
   */

  private loadVehicles(): void {
    const currentCustomer =
      this.customer();

    if (
      !currentCustomer ||
      this.isLoadingVehicles()
    ) {
      return;
    }

    this.vehiclesErrorMessage.set(
      null
    );

    this.isLoadingVehicles.set(
      true
    );

    this.customerVehicleApi
      .getAgentVehicles(
        currentCustomer
          .customerProfileId
      )
      .pipe(
        finalize(() => {
          this.isLoadingVehicles.set(
            false
          );

          this.vehiclesLoaded.set(
            true
          );
        })
      )
      .subscribe({
        next: customerVehicles => {
          this.vehicles.set(
            customerVehicles
          );
        },

        error: error => {
          this.vehicles.set([]);

          if (error?.status === 403) {
            this.vehiclesErrorMessage.set(
              'This Customer is not assigned to your Agent account.'
            );

            return;
          }

          if (error?.status === 404) {
            this.vehiclesErrorMessage.set(
              'The Customer could not be found.'
            );

            return;
          }

          this.vehiclesErrorMessage.set(
            'Vehicles could not be loaded. Please try again.'
          );
        }
      });
  }

  /*
   * =====================================================
   * ROUTE HELPERS
   * =====================================================
   */

  private getCustomerProfileId():
    string | null {
    return this.route.snapshot
      .paramMap
      .get('id');
  }
}
