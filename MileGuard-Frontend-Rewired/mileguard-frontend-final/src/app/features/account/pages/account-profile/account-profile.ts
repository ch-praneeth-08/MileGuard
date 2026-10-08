import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import {
  RouterLink
} from '@angular/router';

import {
  AuthSession
} from '../../../../core/auth/auth-session';

import {
  MgIcon
} from '../../../../shared/ui/mg-icon/mg-icon';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [
    RouterLink,
    MgIcon
  ],
  templateUrl: './account-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountProfile {
  private readonly authSession =
    inject(AuthSession);

  readonly currentUser =
    this.authSession.currentUser;
}
