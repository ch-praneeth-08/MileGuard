import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsOfficerClaimDetailPage } from './claims-officer-claim-detail';

describe('ClaimsOfficerClaimDetailPage', () => {
  let component: ClaimsOfficerClaimDetailPage;
  let fixture: ComponentFixture<ClaimsOfficerClaimDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsOfficerClaimDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsOfficerClaimDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
