import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerClaims } from './customer-claims';

describe('CustomerClaims', () => {
  let component: CustomerClaims;
  let fixture: ComponentFixture<CustomerClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerClaims],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerClaims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
