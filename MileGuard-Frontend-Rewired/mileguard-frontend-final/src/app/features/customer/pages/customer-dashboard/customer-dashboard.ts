import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuthSession } from '../../../../core/auth/auth-session';
import { CustomerVehicleApi } from '../../../customer-vehicle/services/customer-vehicle-api';
import { PolicyBillingApi } from '../../../policy-billing/services/policy-billing-api';
import { UnderwritingApi } from '../../../underwriting/services/underwriting-api';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDashboard implements OnInit {
  private readonly auth = inject(AuthSession);
  private readonly customerApi = inject(CustomerVehicleApi);
  private readonly policyApi = inject(PolicyBillingApi);
  private readonly underwritingApi = inject(UnderwritingApi);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly loading = signal(true);
  readonly profile = signal<any>(null);
  readonly vehicles = signal<any[]>([]);
  readonly policies = signal<any[]>([]);
  readonly underwriting = signal<any[]>([]);
  readonly greeting = computed(() => `Good morning, ${this.user()?.firstName ?? 'there'}`);

  readonly nextAction = computed(() => {
    const p = this.profile();
    if (!p) return { label: 'Complete your insurance profile', route: ['/customer/profile/setup'] };
    if (!p.driverProfile) return { label: 'Add your primary driver details', route: ['/customer/driver'] };
    if (this.vehicles().length === 0) return { label: 'Add your first vehicle', route: ['/customer/vehicles'] };
    const openUw = this.underwriting().find(x => !['approved','rejected','completed','declined'].includes(this.normalize(String(x.status))));
    if (openUw) return { label: 'Check your underwriting status', route: ['/customer/underwriting', openUw.applicationId] };
    if (this.policies().length) return { label: 'Review your current policy', route: ['/customer/policies'] };
    return { label: 'Continue your insurance journey', route: ['/customer/underwriting'] };
  });

  ngOnInit(): void {
    forkJoin({
      profile: this.customerApi.getMyProfile().pipe(catchError(() => of(null))),
      vehicles: this.customerApi.getMyVehicles().pipe(catchError(() => of([]))),
      policies: this.policyApi.getMyPolicies().pipe(catchError(() => of([]))),
      underwriting: this.underwritingApi.getCustomerApplications().pipe(catchError(() => of([])))
    }).subscribe({ next: v => { this.profile.set(v.profile); this.vehicles.set(v.vehicles as any[]); this.policies.set(v.policies as any[]); this.underwriting.set(v.underwriting as any[]); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
  openNext(): void { void this.router.navigate(this.nextAction().route); }
  private normalize(value: string): string { return value.trim().toLowerCase().replace(/[\s_-]+/g, ''); }
}
