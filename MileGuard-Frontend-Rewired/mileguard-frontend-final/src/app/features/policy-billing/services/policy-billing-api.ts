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
  AcceptPurchaseRequest,
  AcceptPurchaseResponse,
  ConfigurePurchaseRequest,
  ConfigurePurchaseResponse,
  PurchaseLifecycle
} from '../../../core/models/policy-billing/purchase.models';

import {
  FirstPaymentResponse,
  InstallmentPaymentResponse,
  MakePaymentRequest
} from '../../../core/models/policy-billing/payment.models';

import {
  CancelPolicyResponse,
  PolicyDetail,
  PolicyListItem,
  PolicyPayments
} from '../../../core/models/policy-billing/policy.models';

import {
  AgentPolicyRenewal,
  StartRenewalResponse
} from '../../../core/models/policy-billing/renewal.models';

@Injectable({
  providedIn: 'root'
})
export class PolicyBillingApi {

  private readonly http =
    inject(HttpClient);

  private readonly apiBaseUrl =
    `${environment.apiGatewayBaseUrl}/policy-billing/api`;

  private readonly purchaseBaseUrl =
    `${this.apiBaseUrl}/customer/purchases`;

  private readonly policyBaseUrl =
    `${this.apiBaseUrl}/customer/policies`;

  private readonly installmentBaseUrl =
    `${this.apiBaseUrl}/customer/installments`;

  private readonly agentBaseUrl =
    `${this.apiBaseUrl}/agent`;

  // ============================================================
  // CUSTOMER PURCHASE
  // ============================================================

  configurePurchase(
    underwritingApplicationId: string,
    request: ConfigurePurchaseRequest
  ): Observable<ConfigurePurchaseResponse> {
    return this.http.post<ConfigurePurchaseResponse>(
      `${this.purchaseBaseUrl}/${underwritingApplicationId}/configure`,
      request,
      {
        withCredentials: true
      }
    );
  }

  acceptPurchase(
    underwritingApplicationId: string,
    request: AcceptPurchaseRequest
  ): Observable<AcceptPurchaseResponse> {
    return this.http.post<AcceptPurchaseResponse>(
      `${this.purchaseBaseUrl}/${underwritingApplicationId}/accept`,
      request,
      {
        withCredentials: true
      }
    );
  }

  makeFirstPayment(
    purchaseId: string,
    request: MakePaymentRequest
  ): Observable<FirstPaymentResponse> {
    return this.http.post<FirstPaymentResponse>(
      `${this.purchaseBaseUrl}/${purchaseId}/payments`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getPurchaseLifecycle(
    underwritingApplicationId: string
  ): Observable<PurchaseLifecycle> {
    return this.http.get<PurchaseLifecycle>(
      `${this.purchaseBaseUrl}/by-application/${underwritingApplicationId}`,
      {
        withCredentials: true
      }
    );
  }

  // ============================================================
  // CUSTOMER POLICIES
  // ============================================================

  getMyPolicies():
    Observable<PolicyListItem[]> {
    return this.http.get<PolicyListItem[]>(
      this.policyBaseUrl,
      {
        withCredentials: true
      }
    );
  }

  getPolicy(
    policyId: string
  ): Observable<PolicyDetail> {
    return this.http.get<PolicyDetail>(
      `${this.policyBaseUrl}/${policyId}`,
      {
        withCredentials: true
      }
    );
  }

  getPolicyPayments(
    policyId: string
  ): Observable<PolicyPayments> {
    return this.http.get<PolicyPayments>(
      `${this.policyBaseUrl}/${policyId}/payments`,
      {
        withCredentials: true
      }
    );
  }

  getPolicyDocument(
    policyId: string
  ): Observable<Blob> {
    return this.http.get(
      `${this.policyBaseUrl}/${policyId}/document`,
      {
        withCredentials: true,
        responseType: 'blob'
      }
    );
  }

  cancelPolicy(
    policyId: string
  ): Observable<CancelPolicyResponse> {
    return this.http.post<CancelPolicyResponse>(
      `${this.policyBaseUrl}/${policyId}/cancel`,
      {},
      {
        withCredentials: true
      }
    );
  }

  // ============================================================
  // CUSTOMER INSTALLMENT PAYMENTS
  // ============================================================

  payInstallment(
    installmentId: string,
    request: MakePaymentRequest
  ): Observable<InstallmentPaymentResponse> {
    return this.http.post<InstallmentPaymentResponse>(
      `${this.installmentBaseUrl}/${installmentId}/payments`,
      request,
      {
        withCredentials: true
      }
    );
  }

  // ============================================================
  // AGENT POLICIES
  // ============================================================

  getAgentCustomerPolicies(
    customerProfileId: string
  ): Observable<PolicyListItem[]> {
    return this.http.get<PolicyListItem[]>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/policies`,
      {
        withCredentials: true
      }
    );
  }

  getAgentPolicy(
    policyId: string
  ): Observable<PolicyDetail> {
    return this.http.get<PolicyDetail>(
      `${this.agentBaseUrl}/policies/${policyId}`,
      {
        withCredentials: true
      }
    );
  }

  getAgentPolicyPayments(
    policyId: string
  ): Observable<PolicyPayments> {
    return this.http.get<PolicyPayments>(
      `${this.agentBaseUrl}/policies/${policyId}/payments`,
      {
        withCredentials: true
      }
    );
  }

  getAgentPolicyDocument(
    policyId: string
  ): Observable<Blob> {
    return this.http.get(
      `${this.agentBaseUrl}/policies/${policyId}/document`,
      {
        withCredentials: true,
        responseType: 'blob'
      }
    );
  }

  // ============================================================
  // AGENT RENEWAL
  // ============================================================

  getAgentPolicyRenewal(
    policyId: string
  ): Observable<AgentPolicyRenewal> {
    return this.http.get<AgentPolicyRenewal>(
      `${this.agentBaseUrl}/policies/${policyId}/renewal`,
      {
        withCredentials: true
      }
    );
  }

  startAgentRenewal(
    policyId: string
  ): Observable<StartRenewalResponse> {
    return this.http.post<StartRenewalResponse>(
      `${this.agentBaseUrl}/policies/${policyId}/renewal`,
      {},
      {
        withCredentials: true
      }
    );
  }
}
