import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { UnderwritingApi } from '../services/underwriting-api';
import { UnderwriterApplicationListItem, UnderwriterReview, UnderwriterReviewSection, UpdateReviewSectionRequest, MakeUnderwritingDecisionRequest } from '../../../core/models/underwriting.models';

@Injectable({ providedIn: 'root' })
export class UnderwriterFacade {
  private readonly api = inject(UnderwritingApi);
  readonly applications = signal<UnderwriterApplicationListItem[]>([]);
  readonly selectedReview = signal<UnderwriterReview | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadApplications(): void {
    this.loading.set(true); this.error.set(null);
    this.api.getMyUnderwritingApplications().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: value => this.applications.set(value),
      error: () => this.error.set('Underwriting applications could not be loaded. Please try again.')
    });
  }

  loadReview(applicationId: string): void {
    this.loading.set(true); this.error.set(null);
    this.api.getUnderwriterReview(applicationId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: value => this.selectedReview.set(value),
      error: () => this.error.set('The underwriting review could not be loaded. Please try again.')
    });
  }

  updateDriver(applicationId: string, request: UpdateReviewSectionRequest) { return this.api.updateDriverReview(applicationId, request); }
  updateVehicle(applicationId: string, request: UpdateReviewSectionRequest) { return this.api.updateVehicleReview(applicationId, request); }
  updateInsuranceQuote(applicationId: string, request: UpdateReviewSectionRequest) { return this.api.updateInsuranceQuoteReview(applicationId, request); }
  updateOverallRisk(applicationId: string, request: UpdateReviewSectionRequest) { return this.api.updateOverallRiskReview(applicationId, request); }
  decide(applicationId: string, request: MakeUnderwritingDecisionRequest) { return this.api.makeDecision(applicationId, request); }
}
