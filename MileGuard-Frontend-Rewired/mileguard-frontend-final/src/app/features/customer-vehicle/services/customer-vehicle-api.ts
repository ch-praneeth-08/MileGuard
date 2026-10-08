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
  CreateCustomerProfileRequest,
  CustomerProfile,
  UpdateCustomerProfileRequest
} from '../../../core/models/customer-profile.models';

import {
  ApiMessageResponse,
  UpsertVehicleRequest,
  Vehicle
} from '../../../core/models/vehicle.models';

import {
  CustomerReadiness
} from '../../../core/models/customer-readiness.models';

import {
  AgentAssignment,
  AssignmentReviewCustomer,
  AssignAgentRequest,
  EligibleAgent,
  UnassignedCustomer
} from '../../../core/models/agent-assignment.models';

import {
  AgentCustomerListItem,
  AgentCustomerWorkspace
} from '../../../core/models/agent-customer.models';

import {
  Driver,
  UpsertDriverRequest
} from '../../../core/models/driver.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerVehicleApi {
  private readonly http =
    inject(HttpClient);

  private readonly apiBaseUrl =
    `${environment.apiGatewayBaseUrl}/customer-vehicle/api`;

  private readonly customerBaseUrl =
    `${this.apiBaseUrl}/customers`;

  private readonly agentBaseUrl =
    `${this.apiBaseUrl}/agent`;

  private readonly adminBaseUrl =
    `${this.apiBaseUrl}/admin`;

  private readonly vehicleBaseUrl =
    `${this.apiBaseUrl}/vehicles`;

  getMyProfile():
    Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(
      `${this.customerBaseUrl}/me`,
      {
        withCredentials: true
      }
    );
  }

  createMyProfile(
    request: CreateCustomerProfileRequest
  ): Observable<CustomerProfile> {
    return this.http.post<CustomerProfile>(
      `${this.customerBaseUrl}/me`,
      request,
      {
        withCredentials: true
      }
    );
  }

  updateMyProfile(
    request: UpdateCustomerProfileRequest
  ): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(
      `${this.customerBaseUrl}/me`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getMyReadiness():
    Observable<CustomerReadiness> {
    return this.http.get<CustomerReadiness>(
      `${this.customerBaseUrl}/me/readiness`,
      {
        withCredentials: true
      }
    );
  }

  getMyDriver():
    Observable<Driver> {
    return this.http.get<Driver>(
      `${this.customerBaseUrl}/me/driver`,
      {
        withCredentials: true
      }
    );
  }

  getMyVehicles():
    Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(
      `${this.customerBaseUrl}/me/vehicles`,
      {
        withCredentials: true
      }
    );
  }

  getAgentCustomers():
    Observable<AgentCustomerListItem[]> {
    return this.http.get<
      AgentCustomerListItem[]
    >(
      `${this.agentBaseUrl}/customers`,
      {
        withCredentials: true
      }
    );
  }

  getAgentCustomer(
    customerProfileId: string
  ): Observable<AgentCustomerWorkspace> {
    return this.http.get<
      AgentCustomerWorkspace
    >(
      `${this.agentBaseUrl}/customers/${customerProfileId}`,
      {
        withCredentials: true
      }
    );
  }

  getAgentCustomerReadiness(
    customerProfileId: string
  ): Observable<CustomerReadiness> {
    return this.http.get<CustomerReadiness>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/readiness`,
      {
        withCredentials: true
      }
    );
  }

  getAgentDriver(
    customerProfileId: string
  ): Observable<Driver> {
    return this.http.get<Driver>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/driver`,
      {
        withCredentials: true
      }
    );
  }

  saveAgentDriver(
    customerProfileId: string,
    request: UpsertDriverRequest
  ): Observable<Driver> {
    return this.http.put<Driver>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/driver`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getAgentVehicles(
    customerProfileId: string
  ): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/vehicles`,
      {
        withCredentials: true
      }
    );
  }

  createAgentVehicle(
    customerProfileId: string,
    request: UpsertVehicleRequest
  ): Observable<Vehicle> {
    return this.http.post<Vehicle>(
      `${this.agentBaseUrl}/customers/${customerProfileId}/vehicles`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getVehicle(
    vehicleId: string
  ): Observable<Vehicle> {
    return this.http.get<Vehicle>(
      `${this.vehicleBaseUrl}/${vehicleId}`,
      {
        withCredentials: true
      }
    );
  }

  updateAgentVehicle(
    vehicleId: string,
    request: UpsertVehicleRequest
  ): Observable<Vehicle> {
    return this.http.put<Vehicle>(
      `${this.vehicleBaseUrl}/${vehicleId}`,
      request,
      {
        withCredentials: true
      }
    );
  }

  uploadVehicleImage(
    vehicleId: string,
    file: File
  ): Observable<ApiMessageResponse> {
    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    return this.http.post<ApiMessageResponse>(
      `${this.vehicleBaseUrl}/${vehicleId}/image`,
      formData,
      {
        withCredentials: true
      }
    );
  }

  getVehicleImage(
    vehicleId: string
  ): Observable<Blob> {
    return this.http.get(
      `${this.vehicleBaseUrl}/${vehicleId}/image`,
      {
        withCredentials: true,
        responseType: 'blob'
      }
    );
  }

  getUnassignedCustomers():
    Observable<UnassignedCustomer[]> {
    return this.http.get<
      UnassignedCustomer[]
    >(
      `${this.adminBaseUrl}/customers/unassigned`,
      {
        withCredentials: true
      }
    );
  }

  getCustomerForAssignment(
    customerProfileId: string
  ): Observable<AssignmentReviewCustomer> {
    return this.http.get<
      AssignmentReviewCustomer
    >(
      `${this.adminBaseUrl}/customers/${customerProfileId}`,
      {
        withCredentials: true
      }
    );
  }

  getEligibleAgents():
    Observable<EligibleAgent[]> {
    return this.http.get<
      EligibleAgent[]
    >(
      `${this.adminBaseUrl}/agents/eligible`,
      {
        withCredentials: true
      }
    );
  }

  assignAgent(
    customerProfileId: string,
    request: AssignAgentRequest
  ): Observable<AgentAssignment> {
    return this.http.post<AgentAssignment>(
      `${this.adminBaseUrl}/customers/${customerProfileId}/agent`,
      request,
      {
        withCredentials: true
      }
    );
  }
}
