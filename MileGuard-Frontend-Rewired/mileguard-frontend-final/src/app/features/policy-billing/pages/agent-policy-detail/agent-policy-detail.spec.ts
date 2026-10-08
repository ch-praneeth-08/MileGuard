import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPolicyDetail } from './agent-policy-detail';

describe('AgentPolicyDetail', () => {
  let component: AgentPolicyDetail;
  let fixture: ComponentFixture<AgentPolicyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentPolicyDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentPolicyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
