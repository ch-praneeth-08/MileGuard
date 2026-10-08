import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ClaimsApi } from '../services/claims-api';
import { ClaimsOfficerClaimDetail, ClaimsOfficerClaimListItem, ApproveClaimRequest, RejectClaimRequest, SettleClaimRequest } from '../../../core/models/claims/claims-officer.models';

@Injectable({ providedIn: 'root' })
export class ClaimsOfficerFacade {
  private readonly api = inject(ClaimsApi);
  readonly claims = signal<ClaimsOfficerClaimListItem[]>([]);
  readonly selectedClaim = signal<ClaimsOfficerClaimDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadClaims(): void {
    this.loading.set(true); this.error.set(null);
    this.api.getAssignedClaims().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: value => this.claims.set(value),
      error: () => this.error.set('Assigned claims could not be loaded. Please try again.')
    });
  }

  loadClaim(claimId: string): void {
    this.loading.set(true); this.error.set(null);
    this.api.getClaimsOfficerClaim(claimId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: value => this.selectedClaim.set(value),
      error: () => this.error.set('The claim could not be loaded. Please try again.')
    });
  }

  startReview(claimId: string) { return this.api.startClaimReview(claimId); }
  approve(claimId: string, request: ApproveClaimRequest) { return this.api.approveClaim(claimId, request); }
  reject(claimId: string, request: RejectClaimRequest) { return this.api.rejectClaim(claimId, request); }
  settle(claimId: string, request: SettleClaimRequest) { return this.api.settleClaim(claimId, request); }
  close(claimId: string) { return this.api.closeClaim(claimId); }
}
