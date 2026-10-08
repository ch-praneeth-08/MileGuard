import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'mg-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class.ok]="tone === 'ok'" [class.warn]="tone === 'warn'" [class.info]="tone === 'info'" [class.danger]="tone === 'danger'">{{ label }}</span>`,
  styles: [`
    .status-badge { display:inline-flex; align-items:center; border-radius:999px; padding:.35rem .7rem; font-size:.7rem; font-weight:700; background:#f1f2ef; color:var(--mg-text-muted); }
    .ok { background:#e9f4eb; color:#277342; } .warn { background:#fff1d9; color:#9a6b18; } .info { background:#e7f0f5; color:#3e657b; } .danger { background:#f8e8e8; color:#9a4848; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadge {
  @Input() label = '';
  @Input() tone: 'neutral' | 'ok' | 'warn' | 'info' | 'danger' = 'neutral';
}
