import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UNDERWRITER_NAVIGATION, RoleNavigationSection } from '../../core/routing/role-navigation';
import { RoleShellBase } from '../role-shell-base';

@Component({
  selector: 'app-underwriter-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './underwriter-shell.html',
  styleUrl: './underwriter-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnderwriterShell extends RoleShellBase {
  readonly navigation: readonly RoleNavigationSection[] = UNDERWRITER_NAVIGATION;
  readonly shellTitle = 'Underwriter';
  readonly shellSubtitle = 'Underwriter workspace';
}
