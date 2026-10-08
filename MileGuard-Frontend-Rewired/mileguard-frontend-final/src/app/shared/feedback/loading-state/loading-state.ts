import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({ selector:'mg-loading-state', standalone:true, template:'<div class="loading-state" [attr.aria-label]="label"><div class="bar"></div><div class="bar short"></div><div class="bar"></div></div>', styles:[`.loading-state{padding:1.25rem;border:1px solid var(--mg-border-light);border-radius:1rem;background:white}.bar{height:.8rem;width:100%;margin:.55rem 0;border-radius:.5rem;background:var(--mg-bg-soft);animation:pulse 1.4s ease-in-out infinite}.short{width:55%}@keyframes pulse{50%{opacity:.45}}`], changeDetection:ChangeDetectionStrategy.OnPush })
export class LoadingState { @Input() label = 'Loading'; }
