import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  AdminActionResponse,
  ApproveInternalRegistrationRequest,
  InternalRegistrationDetail,
  InternalUser,
  InternalUserDetail,
  PendingInternalRegistration
} from '../../../core/models/admin-identity.models';
@Injectable({
  providedIn: 'root'
})
export class AdminIdentityApi {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
  `${environment.apiGatewayBaseUrl}/identity/api/admin`;

  getPendingRegistrations():
    Observable<PendingInternalRegistration[]> {
    return this.http.get<PendingInternalRegistration[]>(
      `${this.baseUrl}/internal-registrations`
    );
  }

  getPendingRegistration(
    id: string
  ): Observable<InternalRegistrationDetail> {
    return this.http.get<InternalRegistrationDetail>(
      `${this.baseUrl}/internal-registrations/${id}`
    );
  }

  approveRegistration(
    id: string,
    request: ApproveInternalRegistrationRequest
  ): Observable<AdminActionResponse> {
    return this.http.post<AdminActionResponse>(
      `${this.baseUrl}/internal-registrations/${id}/approve`,
      request
    );
  }

  rejectRegistration(
    id: string
  ): Observable<AdminActionResponse> {
    return this.http.post<AdminActionResponse>(
      `${this.baseUrl}/internal-registrations/${id}/reject`,
      {}
    );
  }

  getUsers(): Observable<InternalUser[]> {
    return this.http.get<InternalUser[]>(
      `${this.baseUrl}/users`
    );
  }
  getUser(
  id: string
): Observable<InternalUserDetail> {
  return this.http.get<InternalUserDetail>(
    `${this.baseUrl}/users/${id}`
  );
}
}
