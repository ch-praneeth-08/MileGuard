import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApiMessageResponse,
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  TwoFactorEnrollmentResponse
} from '../../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
  `${environment.apiGatewayBaseUrl}/identity/api/auth`;

  registerCustomer(
    request: RegisterRequest
  ): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/register`,
      request
    );
  }

  registerInternal(
    request: RegisterRequest
  ): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/internal/register`,
      request
    );
  }

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(
      `${this.baseUrl}/me`,
      {
        withCredentials: true
      }
    );
  }

  refresh(): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(
      `${this.baseUrl}/refresh`,
      {},
      {
        withCredentials: true
      }
    );
  }

  logout(): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/logout`,
      {},
      {
        withCredentials: true
      }
    );
  }

  beginTwoFactorEnrollment(
    preAuthToken: string
  ): Observable<TwoFactorEnrollmentResponse> {
    return this.http.post<TwoFactorEnrollmentResponse>(
      `${this.baseUrl}/2fa/enroll`,
      {},
      {
        headers: new HttpHeaders({
          'X-Pre-Auth-Token': preAuthToken
        }),
        withCredentials: true
      }
    );
  }

  verifyTwoFactor(
    preAuthToken: string,
    code: string
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/2fa/verify`,
      {
        code
      },
      {
        headers: new HttpHeaders({
          'X-Pre-Auth-Token': preAuthToken
        }),
        withCredentials: true
      }
    );
  }
}
