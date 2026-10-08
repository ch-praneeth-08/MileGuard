import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerVehicleApi } from '../../../customer-vehicle/services/customer-vehicle-api';

@Component({ selector:'app-agent-dashboard', standalone:true, templateUrl:'./agent-dashboard.html', styleUrl:'./agent-dashboard.css', changeDetection:ChangeDetectionStrategy.OnPush })
export class AgentDashboard implements OnInit {
  private readonly customersApi = inject(CustomerVehicleApi);
  private readonly router = inject(Router);
  readonly customers = signal<any[]>([]); readonly claims = signal<any[]>([]); readonly greeting = 'Good morning';
  readonly customersNeedingAction = computed(() => this.customers().filter(x => String(x.profileStatus ?? '').toLowerCase() !== 'completed').length);
  readonly activeClaims = computed(() => this.claims().filter(x => !['closed','settled'].includes(this.normalize(String(x.status)))).length);
  readonly quotesAttention = signal(0); readonly underwritingAttention = signal(0);
  ngOnInit(): void { this.customersApi.getAgentCustomers().subscribe({ next:v=>this.customers.set(v), error:()=>this.customers.set([])}); this.claims.set([]); }
  openCustomers(): void { void this.router.navigate(['/agent/customers']); }
  private normalize(v:string):string{return v.trim().toLowerCase().replace(/[\s_-]+/g,'');}
}
