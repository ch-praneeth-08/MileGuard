import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  Observable
} from 'rxjs';
import { PurchaseLifecycle } from '../../../core/models/policy-billing/purchase.models';
import {
  environment
} from '../../../../environments/environment';

import {
  AdminApplicationDetail,
  AssignUnderwriterRequest,
  CustomerOfferResponse,
  CustomerUnderwritingDetail,
  CustomerUnderwritingListItem,
  EligibleUnderwriterWithWorkload,
  MakeUnderwritingDecisionRequest,
  UnderwriterApplicationListItem,
  UnderwriterReview,
  UnderwriterReviewSection,
  UnderwritingDecision,
  UnassignedApplication,
  UpdateReviewSectionRequest
} from '../../../core/models/underwriting.models';

@Injectable({
  providedIn: 'root'
})
export class UnderwritingApi {
  private readonly http =
    inject(HttpClient);

  private readonly apiBaseUrl =
    `${environment.apiGatewayBaseUrl}/underwriting/api`;

  private readonly adminBaseUrl =
    `${this.apiBaseUrl}/admin/underwriting`;

  private readonly underwriterBaseUrl =
    `${this.apiBaseUrl}/underwriter/underwriting`;

  private readonly customerBaseUrl =
    `${this.apiBaseUrl}/customer/underwriting`;

  // ============================================================
  // ADMIN
  // ============================================================

  getUnassignedApplications():
    Observable<UnassignedApplication[]> {
    return this.http.get<
      UnassignedApplication[]
    >(
      `${this.adminBaseUrl}/unassigned`,
      {
        withCredentials: true
      }
    );
  }

  getPurchaseLifecycle(
  underwritingApplicationId: string
) {
  return this.http.get<PurchaseLifecycle>(
    `${this.apiBaseUrl}/customer/purchases/by-application/${underwritingApplicationId}`
  );
}

  getAdminApplication(
    applicationId: string
  ): Observable<AdminApplicationDetail> {
    return this.http.get<
      AdminApplicationDetail
    >(
      `${this.adminBaseUrl}/${applicationId}`,
      {
        withCredentials: true
      }
    );
  }

  getEligibleUnderwriters():
    Observable<
      EligibleUnderwriterWithWorkload[]
    > {
    return this.http.get<
      EligibleUnderwriterWithWorkload[]
    >(
      `${this.adminBaseUrl}/eligible-underwriters`,
      {
        withCredentials: true
      }
    );
  }

  assignUnderwriter(
    applicationId: string,
    request: AssignUnderwriterRequest
  ): Observable<AdminApplicationDetail> {
    return this.http.post<
      AdminApplicationDetail
    >(
      `${this.adminBaseUrl}/${applicationId}/assign`,
      request,
      {
        withCredentials: true
      }
    );
  }

  // ============================================================
  // UNDERWRITER
  // ============================================================

  getMyUnderwritingApplications():
    Observable<
      UnderwriterApplicationListItem[]
    > {
    return this.http.get<
      UnderwriterApplicationListItem[]
    >(
      `${this.underwriterBaseUrl}/my-applications`,
      {
        withCredentials: true
      }
    );
  }

  getUnderwriterReview(
    applicationId: string
  ): Observable<UnderwriterReview> {
    return this.http.get<
      UnderwriterReview
    >(
      `${this.underwriterBaseUrl}/${applicationId}/review`,
      {
        withCredentials: true
      }
    );
  }

  updateDriverReview(
    applicationId: string,
    request: UpdateReviewSectionRequest
  ): Observable<UnderwriterReviewSection> {
    return this.updateReviewSection(
      applicationId,
      'driver',
      request
    );
  }

  updateVehicleReview(
    applicationId: string,
    request: UpdateReviewSectionRequest
  ): Observable<UnderwriterReviewSection> {
    return this.updateReviewSection(
      applicationId,
      'vehicle',
      request
    );
  }

  updateInsuranceQuoteReview(
    applicationId: string,
    request: UpdateReviewSectionRequest
  ): Observable<UnderwriterReviewSection> {
    return this.updateReviewSection(
      applicationId,
      'insurance-quote',
      request
    );
  }

  updateOverallRiskReview(
    applicationId: string,
    request: UpdateReviewSectionRequest
  ): Observable<UnderwriterReviewSection> {
    return this.updateReviewSection(
      applicationId,
      'overall-risk',
      request
    );
  }

  makeDecision(
    applicationId: string,
    request: MakeUnderwritingDecisionRequest
  ): Observable<UnderwritingDecision> {
    return this.http.post<
      UnderwritingDecision
    >(
      `${this.underwriterBaseUrl}/${applicationId}/decision`,
      request,
      {
        withCredentials: true
      }
    );
  }

  // ============================================================
  // CUSTOMER
  // ============================================================

  getCustomerApplications():
    Observable<
      CustomerUnderwritingListItem[]
    > {
    return this.http.get<
      CustomerUnderwritingListItem[]
    >(
      this.customerBaseUrl,
      {
        withCredentials: true
      }
    );
  }

  getCustomerApplication(
    applicationId: string
  ): Observable<CustomerUnderwritingDetail> {
    return this.http.get<
      CustomerUnderwritingDetail
    >(
      `${this.customerBaseUrl}/${applicationId}`,
      {
        withCredentials: true
      }
    );
  }

  acceptOffer(
    applicationId: string
  ): Observable<CustomerOfferResponse> {
    return this.http.post<
      CustomerOfferResponse
    >(
      `${this.customerBaseUrl}/${applicationId}/accept`,
      {},
      {
        withCredentials: true
      }
    );
  }

  declineOffer(
    applicationId: string
  ): Observable<CustomerOfferResponse> {
    return this.http.post<
      CustomerOfferResponse
    >(
      `${this.customerBaseUrl}/${applicationId}/decline`,
      {},
      {
        withCredentials: true
      }
    );
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private updateReviewSection(
    applicationId: string,
    section:
      | 'driver'
      | 'vehicle'
      | 'insurance-quote'
      | 'overall-risk',
    request: UpdateReviewSectionRequest
  ): Observable<UnderwriterReviewSection> {
    return this.http.put<
      UnderwriterReviewSection
    >(
      `${this.underwriterBaseUrl}/${applicationId}/sections/${section}`,
      request,
      {
        withCredentials: true
      }
    );
  }
}
