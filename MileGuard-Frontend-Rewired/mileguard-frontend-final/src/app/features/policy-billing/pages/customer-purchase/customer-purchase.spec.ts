import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPurchase } from './customer-purchase';

describe('CustomerPurchase', () => {
  let component: CustomerPurchase;
  let fixture: ComponentFixture<CustomerPurchase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPurchase],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerPurchase);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
