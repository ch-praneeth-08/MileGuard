import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClaimsOfficerFacade } from '../../../claims/state/claims-officer-facade';
@Component({
  selector: 'app-claims-officer-dashboard',
  standalone: true,
  templateUrl: './claims-officer-dashboard.html',
  styleUrl: './claims-officer-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimsOfficerDashboard implements OnInit {
  private readonly facade = inject(ClaimsOfficerFacade);
  private readonly router = inject(Router);
  readonly claims = this.facade.claims;
  readonly greeting = 'Keep the claim lifecycle moving from review to settlement.';
  readonly nextAction = 'Open Claims and work the next assigned item.';
  readonly assigned = computed(() => this.claims().length);
  readonly inReview = computed(() => this.claims().filter(x => this.normalize(String(x.status)).includes('review')).length);
  readonly approved = computed(() => this.claims().filter(x => this.normalize(String(x.status)) === 'approved').length);
  readonly settled = computed(() => this.claims().filter(x => this.normalize(String(x.status)) === 'settled').length);
  ngOnInit(): void { this.facade.loadClaims(); }
  openClaims(): void { void this.router.navigate(['/claims-officer/claims']); }
  private normalize(value: string): string { return value.trim().toLowerCase().replace(/[\s_-]+/g, ''); }
}
