import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentCustomerClaims } from './agent-customer-claims';

describe('AgentCustomerClaims', () => {
  let component: AgentCustomerClaims;
  let fixture: ComponentFixture<AgentCustomerClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentCustomerClaims],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCustomerClaims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
