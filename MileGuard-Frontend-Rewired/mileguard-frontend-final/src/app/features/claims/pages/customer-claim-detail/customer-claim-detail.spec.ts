import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerClaimDetailPage } from './customer-claim-detail';

describe('CustomerClaimDetailPage', () => {
  let component: CustomerClaimDetailPage;
  let fixture: ComponentFixture<CustomerClaimDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerClaimDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerClaimDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
