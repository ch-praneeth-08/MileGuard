import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUnassignedClaims } from './admin-unassigned-claims';

describe('AdminUnassignedClaims', () => {
  let component: AdminUnassignedClaims;
  let fixture: ComponentFixture<AdminUnassignedClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUnassignedClaims],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUnassignedClaims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
