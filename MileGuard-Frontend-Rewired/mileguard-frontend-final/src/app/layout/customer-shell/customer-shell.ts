import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CUSTOMER_NAVIGATION, RoleNavigationSection } from '../../core/routing/role-navigation';
import { RoleShellBase } from '../role-shell-base';

@Component({
  selector: 'app-customer-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './customer-shell.html',
  styleUrl: './customer-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerShell extends RoleShellBase {
  readonly navigation: readonly RoleNavigationSection[] = CUSTOMER_NAVIGATION;
  readonly shellTitle = 'Customer';
  readonly shellSubtitle = 'Customer workspace';
}
