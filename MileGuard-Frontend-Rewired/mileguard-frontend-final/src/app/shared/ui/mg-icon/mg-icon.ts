import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'mg-icon',
  standalone: true,
  template: '<span class="inline-flex items-center justify-center leading-none" aria-hidden="true">{{ glyph }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MgIcon {
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get glyph(): string {
    const glyphs: Record<string, string> = {
      'arrow-right': '→',
      'arrow-left': '←',
      home: '⌂',
      person: '◎',
      vehicle: '▱',
      claim: '!',
      policy: '▤',
      menu: '☰',
      logout: '↪'
    };
    return glyphs[this.name] ?? '•';
  }
}
