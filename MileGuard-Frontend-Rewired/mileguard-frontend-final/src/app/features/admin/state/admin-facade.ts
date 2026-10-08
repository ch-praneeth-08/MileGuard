import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';
import { AdminIdentityApi } from '../../identity/services/admin-identity-api';
import { CustomerVehicleApi } from '../../customer-vehicle/services/customer-vehicle-api';
import { UnderwritingApi } from '../../underwriting/services/underwriting-api';
import { ClaimsApi } from '../../claims/services/claims-api';

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly identity = inject(AdminIdentityApi);
  private readonly customerVehicle = inject(CustomerVehicleApi);
  private readonly underwriting = inject(UnderwritingApi);
  private readonly claims = inject(ClaimsApi);

  readonly dashboard = signal({ pendingPeople: 0, unassignedCustomers: 0, unassignedApplications: 0, unassignedClaims: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadDashboard(): void {
    this.loading.set(true); this.error.set(null);
    forkJoin({
      pendingPeople: this.identity.getPendingRegistrations(),
      unassignedCustomers: this.customerVehicle.getUnassignedCustomers(),
      unassignedApplications: this.underwriting.getUnassignedApplications(),
      unassignedClaims: this.claims.getUnassignedClaims()
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: value => this.dashboard.set({
        pendingPeople: value.pendingPeople.length,
        unassignedCustomers: value.unassignedCustomers.length,
        unassignedApplications: value.unassignedApplications.length,
        unassignedClaims: value.unassignedClaims.length
      }),
      error: () => this.error.set('Some operational data is temporarily unavailable. Please retry.')
    });
  }
}
