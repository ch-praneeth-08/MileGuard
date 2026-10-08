import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'mg-card',
  standalone: true,
  template: '<section class="mg-card" [class.mg-card--dark]="dark"><ng-content /></section>',
  styles: [`
    .mg-card { overflow: hidden; border: 1px solid var(--mg-border-light); border-radius: 1.5rem; background: white; box-shadow: var(--mg-shadow-sm); }
    .mg-card--dark { background: var(--mg-green-950); color: white; border-color: transparent; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MgCard { @Input() dark = false; }
