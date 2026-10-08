import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentNewClaim } from './agent-new-claim';

describe('AgentNewClaim', () => {
  let component: AgentNewClaim;
  let fixture: ComponentFixture<AgentNewClaim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentNewClaim],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentNewClaim);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
