import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsOfficerQueue } from './claims-officer-queue';

describe('ClaimsOfficerQueue', () => {
  let component: ClaimsOfficerQueue;
  let fixture: ComponentFixture<ClaimsOfficerQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsOfficerQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsOfficerQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
