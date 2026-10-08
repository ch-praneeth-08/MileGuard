import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ADMIN_NAVIGATION, RoleNavigationSection } from '../../core/routing/role-navigation';
import { RoleShellBase } from '../role-shell-base';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminShell extends RoleShellBase {
  readonly navigation: readonly RoleNavigationSection[] = ADMIN_NAVIGATION;
  readonly shellTitle = 'Admin';
  readonly shellSubtitle = 'Admin workspace';
}
