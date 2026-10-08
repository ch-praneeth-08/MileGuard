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
  FinalizeQuoteResponse,
  Quote as QuoteModel,
  QuoteConfiguration,
  SelectPlanRequest,
  StartQuoteRequest,
  StartQuoteResponse,
  UpdateQuoteConfigurationRequest
} from '../../../core/models/quote.models';

@Injectable({
  providedIn: 'root'
})
export class Quote {
  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiGatewayBaseUrl}/quote-rating/api/agent`;

  getCustomerQuotes(
    customerProfileId: string
  ): Observable<QuoteModel[]> {
    return this.http.get<QuoteModel[]>(
      `${this.baseUrl}/customers/${customerProfileId}/quotes`,
      {
        withCredentials: true
      }
    );
  }

  getQuote(
    quoteId: string
  ): Observable<QuoteModel> {
    return this.http.get<QuoteModel>(
      `${this.baseUrl}/quotes/${quoteId}`,
      {
        withCredentials: true
      }
    );
  }

  getConfiguration(
    quoteId: string
  ): Observable<QuoteConfiguration> {
    return this.http.get<QuoteConfiguration>(
      `${this.baseUrl}/quotes/${quoteId}/configuration`,
      {
        withCredentials: true
      }
    );
  }

  startQuote(
    customerProfileId: string,
    vehicleId: string
  ): Observable<StartQuoteResponse> {
    const request:
      StartQuoteRequest = {
        vehicleId
      };

    return this.http.post<StartQuoteResponse>(
      `${this.baseUrl}/customers/${customerProfileId}/quotes`,
      request,
      {
        withCredentials: true
      }
    );
  }

  selectPlan(
    quoteId: string,
    planCode: number
  ): Observable<QuoteModel> {
    const request:
      SelectPlanRequest = {
        planCode
      };

    return this.http.post<QuoteModel>(
      `${this.baseUrl}/quotes/${quoteId}/select`,
      request,
      {
        withCredentials: true
      }
    );
  }

  updateConfiguration(
    quoteId: string,
    request: UpdateQuoteConfigurationRequest
  ): Observable<QuoteModel> {
    return this.http.put<QuoteModel>(
      `${this.baseUrl}/quotes/${quoteId}/configuration`,
      request,
      {
        withCredentials: true
      }
    );
  }
submitQuote(
  quoteId: string
): Observable<QuoteModel> {
  return this.http.post<QuoteModel>(
    `${this.baseUrl}/quotes/${quoteId}/submit`,
    {},
    {
      withCredentials: true
    }
  );
}


  recalculate(
    quoteId: string
  ): Observable<QuoteModel> {
    return this.http.post<QuoteModel>(
      `${this.baseUrl}/quotes/${quoteId}/recalculate`,
      {},
      {
        withCredentials: true
      }
    );
  }

  finalizeQuote(
    quoteId: string
  ): Observable<FinalizeQuoteResponse> {
    return this.http.post<FinalizeQuoteResponse>(
      `${this.baseUrl}/quotes/${quoteId}/finalize`,
      {},
      {
        withCredentials: true
      }
    );
  }
}
