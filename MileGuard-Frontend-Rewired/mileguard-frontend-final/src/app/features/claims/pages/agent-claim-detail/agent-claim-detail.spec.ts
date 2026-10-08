import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentClaimDetailPage } from './agent-claim-detail';

describe('AgentClaimDetailPage', () => {
  let component: AgentClaimDetailPage;
  let fixture: ComponentFixture<AgentClaimDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentClaimDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentClaimDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
