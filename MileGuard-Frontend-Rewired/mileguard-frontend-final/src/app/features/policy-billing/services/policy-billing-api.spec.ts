import { TestBed } from '@angular/core/testing';

import { PolicyBillingApi } from './policy-billing-api';

describe('PolicyBillingApi', () => {
  let service: PolicyBillingApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyBillingApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
