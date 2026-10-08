import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-workflow-state',
  standalone: true,
  templateUrl: './workflow-state.html',
  styleUrl: './workflow-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowState {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  get eyebrow(): string {
    return this.route.snapshot.data['eyebrow'] ?? 'MileGuard';
  }
  get title(): string {
    return this.route.snapshot.data['title'] ?? 'Something went wrong';
  }
  get message(): string {
    return this.route.snapshot.data['message'] ?? 'We could not complete this request right now.';
  }
  get returnRoute(): string[] {
    return this.route.snapshot.data['returnRoute'] ?? ['/'];
  }

  retry(): void {
    void this.router.navigate(this.returnRoute);
  }
}
