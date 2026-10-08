import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UnderwriterFacade } from '../../state/underwriter-facade';
@Component({
  selector: 'app-underwriting-dashboard',
  standalone: true,
  templateUrl: './underwriting-dashboard.html',
  styleUrl: './underwriting-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnderwriterDashboard implements OnInit {
  private readonly facade = inject(UnderwriterFacade);
  private readonly router = inject(Router);
  readonly applications = this.facade.applications;
  readonly greeting = 'Review the next application, then record the decision.';
  readonly nextAction = 'Open Applications and continue the oldest actionable review.';
  readonly awaitingReview = computed(() => this.applications().filter(x => this.normalize(x.status).includes('pending') || this.normalize(x.status).includes('submitted')).length);
  readonly inReview = computed(() => this.applications().filter(x => this.normalize(x.status).includes('review')).length);
  readonly completed = computed(() => this.applications().filter(x => ['approved','rejected','completed','declined'].includes(this.normalize(x.status))).length);
  readonly actionable = computed(() => this.applications().filter(x => !['approved','rejected','completed','declined'].includes(this.normalize(x.status))).length);
  ngOnInit(): void { this.facade.loadApplications(); }
  openApplications(): void { void this.router.navigate(['/underwriter/applications']); }
  private normalize(value: string): string { return value.trim().toLowerCase().replace(/[\s_-]+/g, ''); }
}
