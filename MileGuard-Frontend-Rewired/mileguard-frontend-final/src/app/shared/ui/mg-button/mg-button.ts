import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'mg-button',
  standalone: true,
  template: `<button [type]="type" [disabled]="disabled" class="mg-button" [class.mg-button--primary]="variant === 'primary'" [class.mg-button--secondary]="variant === 'secondary'" [class.mg-button--ghost]="variant === 'ghost'" [class.mg-button--danger]="variant === 'danger'"><ng-content /></button>`,
  styles: [`
    .mg-button { border-radius: .75rem; padding: .75rem 1.25rem; font-size: .875rem; font-weight: 700; transition: transform .16s ease, background .16s ease, opacity .16s ease; }
    .mg-button:hover:not(:disabled) { transform: translateY(-1px); }
    .mg-button:disabled { opacity: .5; cursor: not-allowed; }
    .mg-button--primary { background: var(--mg-orange-500); color: var(--mg-green-950); }
    .mg-button--secondary { background: var(--mg-green-950); color: white; }
    .mg-button--ghost { border: 1px solid var(--mg-border-light); color: var(--mg-green-950); background: white; }
    .mg-button--danger { background: #a44a4a; color: white; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MgButton {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
}
