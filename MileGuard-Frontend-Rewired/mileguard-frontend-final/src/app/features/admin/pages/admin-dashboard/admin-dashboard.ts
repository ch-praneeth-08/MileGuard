import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminFacade } from '../../state/admin-facade';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboard implements OnInit {
  private readonly facade = inject(AdminFacade);
  private readonly router = inject(Router);
  readonly dashboard = this.facade.dashboard;
  readonly greeting = 'Keep assignments moving and resolve the highest-priority operational gaps.';
  readonly nextAction = 'Start with the queue that has the most immediate dependency on your assignment decisions.';
  ngOnInit(): void { this.facade.loadDashboard(); }
  openAssignments(): void { void this.router.navigate(['/admin/assignments']); }
  openPeople(): void { void this.router.navigate(['/admin/people']); }
}
