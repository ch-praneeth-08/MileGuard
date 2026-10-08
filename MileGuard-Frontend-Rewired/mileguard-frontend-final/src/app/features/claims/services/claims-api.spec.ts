import { TestBed } from '@angular/core/testing';

import { ClaimsApi } from './claims-api';

describe('ClaimsApi', () => {
  let service: ClaimsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaimsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
