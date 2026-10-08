import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({ selector:'mg-section-header', standalone:true, template:'<div class="section-header"><div><p class="eyebrow">{{ eyebrow }}</p><h2>{{ title }}</h2></div><ng-content /></div>', styles:[`.section-header{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1rem}.eyebrow{margin:0 0 .35rem;color:var(--mg-orange-600);font-size:.62rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.section-header h2{margin:0;color:var(--mg-green-950);font-size:1.1rem;font-weight:700}`], changeDetection:ChangeDetectionStrategy.OnPush })
export class SectionHeader { @Input() eyebrow=''; @Input() title=''; }
