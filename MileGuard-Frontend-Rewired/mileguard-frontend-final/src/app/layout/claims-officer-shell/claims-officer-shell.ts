import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CLAIMS_OFFICER_NAVIGATION, RoleNavigationSection } from '../../core/routing/role-navigation';
import { RoleShellBase } from '../role-shell-base';

@Component({
  selector: 'app-claims-officer-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './claims-officer-shell.html',
  styleUrl: './claims-officer-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimsOfficerShell extends RoleShellBase {
  readonly navigation: readonly RoleNavigationSection[] = CLAIMS_OFFICER_NAVIGATION;
  readonly shellTitle = 'Claims Officer';
  readonly shellSubtitle = 'Claims Officer workspace';
}
