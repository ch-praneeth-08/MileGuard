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

import {
  environment
} from '../../../../environments/environment';
import {
  AdminClaimDetail,
  AdminClaimListItem,
  AssignClaimsOfficerRequest,
  EligibleClaimsOfficer
} from '../../../core/models/claims/admin-claim.models';
import {
  AgentClaimDetail,
  AgentClaimListItem,
  SubmitClaimRequest
} from '../../../core/models/claims/agent-claim.models';
import {
  ClaimDetail,
  ClaimListItem
} from '../../../core/models/claims/claim.models';
import {
  ApproveClaimRequest,
  ClaimsOfficerClaimDetail,
  ClaimsOfficerClaimListItem,
  RejectClaimRequest,
  SettleClaimRequest
} from '../../../core/models/claims/claims-officer.models';

@Injectable({
  providedIn: 'root'
})
export class ClaimsApi {
  private readonly http =
    inject(HttpClient);

  private readonly apiBaseUrl =
    `${environment.apiGatewayBaseUrl}/claims/api`;

  private readonly customerBaseUrl =
    `${this.apiBaseUrl}/customer/claims`;

  private readonly agentBaseUrl =
    `${this.apiBaseUrl}/agent`;

  private readonly adminClaimsBaseUrl =
    `${this.apiBaseUrl}/admin/claims`;

  private readonly claimsOfficerBaseUrl =
    `${this.apiBaseUrl}/claims-officer/claims`;

  getMyClaims():
    Observable<ClaimListItem[]> {
    return this.http.get<ClaimListItem[]>(
      this.customerBaseUrl,
      {
        withCredentials: true
      }
    );
  }

  getMyClaim(
    claimId: string
  ): Observable<ClaimDetail> {
    return this.http.get<ClaimDetail>(
      `${this.customerBaseUrl}/${claimId}`,
      {
        withCredentials: true
      }
    );
  }

  getAgentCustomerClaims(
    customerProfileId: string
  ): Observable<AgentClaimListItem[]> {
    return this.http.get<AgentClaimListItem[]>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/claims`,
      {
        withCredentials: true
      }
    );
  }

  submitAgentClaim(
    customerProfileId: string,
    request: SubmitClaimRequest
  ): Observable<AgentClaimDetail> {
    return this.http.post<AgentClaimDetail>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/claims`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getAgentClaim(
    claimId: string
  ): Observable<AgentClaimDetail> {
    return this.http.get<AgentClaimDetail>(
      `${this.agentBaseUrl}/claims/${claimId}`,
      {
        withCredentials: true
      }
    );
  }

  getUnassignedClaims():
    Observable<AdminClaimListItem[]> {
    return this.http.get<AdminClaimListItem[]>(
      `${this.adminClaimsBaseUrl}/unassigned`,
      {
        withCredentials: true
      }
    );
  }

  getAdminClaim(
    claimId: string
  ): Observable<AdminClaimDetail> {
    return this.http.get<AdminClaimDetail>(
      `${this.adminClaimsBaseUrl}/${claimId}`,
      {
        withCredentials: true
      }
    );
  }

  getEligibleClaimsOfficers():
    Observable<EligibleClaimsOfficer[]> {
    return this.http.get<EligibleClaimsOfficer[]>(
      `${this.apiBaseUrl}/admin/claims-officers/eligible`,
      {
        withCredentials: true
      }
    );
  }

  assignClaimsOfficer(
    claimId: string,
    request: AssignClaimsOfficerRequest
  ): Observable<AdminClaimDetail> {
    return this.http.post<AdminClaimDetail>(
      `${this.adminClaimsBaseUrl}/${claimId}/claims-officer`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getAssignedClaims():
    Observable<ClaimsOfficerClaimListItem[]> {
    return this.http.get<ClaimsOfficerClaimListItem[]>(
      this.claimsOfficerBaseUrl,
      {
        withCredentials: true
      }
    );
  }

  getClaimsOfficerClaim(
    claimId: string
  ): Observable<ClaimsOfficerClaimDetail> {
    return this.http.get<ClaimsOfficerClaimDetail>(
      `${this.claimsOfficerBaseUrl}/${claimId}`,
      {
        withCredentials: true
      }
    );
  }

  startClaimReview(
    claimId: string
  ): Observable<ClaimsOfficerClaimDetail> {
    return this.http.post<ClaimsOfficerClaimDetail>(
      `${this.claimsOfficerBaseUrl}/${claimId}/start-review`,
      {},
      {
        withCredentials: true
      }
    );
  }

  approveClaim(
    claimId: string,
    request: ApproveClaimRequest
  ): Observable<ClaimsOfficerClaimDetail> {
    return this.http.post<ClaimsOfficerClaimDetail>(
      `${this.claimsOfficerBaseUrl}/${claimId}/approve`,
      request,
      {
        withCredentials: true
      }
    );
  }

  rejectClaim(
    claimId: string,
    request: RejectClaimRequest
  ): Observable<ClaimsOfficerClaimDetail> {
    return this.http.post<ClaimsOfficerClaimDetail>(
      `${this.claimsOfficerBaseUrl}/${claimId}/reject`,
      request,
      {
        withCredentials: true
      }
    );
  }

  settleClaim(
    claimId: string,
    request: SettleClaimRequest
  ): Observable<ClaimsOfficerClaimDetail> {
    return this.http.post<ClaimsOfficerClaimDetail>(
      `${this.claimsOfficerBaseUrl}/${claimId}/settle`,
      request,
      {
        withCredentials: true
      }
    );
  }

  closeClaim(
    claimId: string
  ): Observable<ClaimsOfficerClaimDetail> {
    return this.http.post<ClaimsOfficerClaimDetail>(
      `${this.claimsOfficerBaseUrl}/${claimId}/close`,
      {},
      {
        withCredentials: true
      }
    );
  }
}
