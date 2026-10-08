import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AGENT_NAVIGATION, RoleNavigationSection } from '../../core/routing/role-navigation';
import { RoleShellBase } from '../role-shell-base';

@Component({
  selector: 'app-agent-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './agent-shell.html',
  styleUrl: './agent-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentShell extends RoleShellBase {
  readonly navigation: readonly RoleNavigationSection[] = AGENT_NAVIGATION;
  readonly shellTitle = 'Agent';
  readonly shellSubtitle = 'Agent workspace';
}
