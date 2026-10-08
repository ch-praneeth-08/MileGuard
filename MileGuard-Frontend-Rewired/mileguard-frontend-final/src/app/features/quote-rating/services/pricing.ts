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
  PricingConfiguration,
  PricingMessageResponse,
  UpdateAddOnPriceRequest,
  UpdateBasePremiumRequest,
  UpdateCoverageOptionPriceRequest,
  UpdateDeductiblePriceRequest,
  UpdateRatingAdjustmentRequest
} from '../../../core/models/pricing';

@Injectable({
  providedIn: 'root'
})
export class Pricing {
  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
  `${environment.apiGatewayBaseUrl}/quote-rating/api/admin/pricing`;

  getConfiguration():
    Observable<PricingConfiguration> {
    return this.http.get<PricingConfiguration>(
      this.baseUrl,
      {
        withCredentials: true
      }
    );
  }

  updateBasePremium(
    request: UpdateBasePremiumRequest
  ): Observable<PricingMessageResponse> {
    return this.http.put<PricingMessageResponse>(
      `${this.baseUrl}/base-premiums`,
      request,
      {
        withCredentials: true
      }
    );
  }

  updateRatingAdjustment(
    request: UpdateRatingAdjustmentRequest
  ): Observable<PricingMessageResponse> {
    return this.http.put<PricingMessageResponse>(
      `${this.baseUrl}/rating-adjustments`,
      request,
      {
        withCredentials: true
      }
    );
  }

  updateCoverageOption(
    request: UpdateCoverageOptionPriceRequest
  ): Observable<PricingMessageResponse> {
    return this.http.put<PricingMessageResponse>(
      `${this.baseUrl}/coverage-options`,
      request,
      {
        withCredentials: true
      }
    );
  }

  updateDeductible(
    request: UpdateDeductiblePriceRequest
  ): Observable<PricingMessageResponse> {
    return this.http.put<PricingMessageResponse>(
      `${this.baseUrl}/deductibles`,
      request,
      {
        withCredentials: true
      }
    );
  }

  updateAddOn(
    request: UpdateAddOnPriceRequest
  ): Observable<PricingMessageResponse> {
    return this.http.put<PricingMessageResponse>(
      `${this.baseUrl}/add-ons`,
      request,
      {
        withCredentials: true
      }
    );
  }
}
