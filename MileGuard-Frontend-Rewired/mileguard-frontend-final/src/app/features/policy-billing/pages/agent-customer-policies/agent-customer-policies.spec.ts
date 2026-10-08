import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentCustomerPolicies } from './agent-customer-policies';

describe('AgentCustomerPolicies', () => {
  let component: AgentCustomerPolicies;
  let fixture: ComponentFixture<AgentCustomerPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentCustomerPolicies],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCustomerPolicies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
