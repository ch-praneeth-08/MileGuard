import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { finalize } from 'rxjs';

import {
  InternalUserDetail
} from '../../../../core/models/admin-identity.models';
import {
  AdminIdentityApi
} from '../../services/admin-identity-api';

@Component({
  selector: 'app-admin-user-detail',
  imports: [
    DatePipe
  ],
  templateUrl: './admin-user-detail.html',
  styleUrl: './admin-user-detail.css'
})
export class AdminUserDetail implements OnInit {
  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly adminApi =
    inject(AdminIdentityApi);

  readonly user =
    signal<InternalUserDetail | null>(null);

  readonly isLoading =
    signal(true);

  readonly errorMessage =
    signal<string | null>(null);

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      void this.router.navigate([
        '/admin'
      ]);

      return;
    }

    this.loadUser(id);
  }

  back(): void {
    void this.router.navigate([
      '/admin'
    ]);
  }

  retry(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.loadUser(id);
  }

  private loadUser(
    id: string
  ): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.adminApi
      .getUser(id)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: user => {
          this.user.set(user);
        },

        error: error => {
          if (error?.status === 404) {
            this.errorMessage.set(
              'The internal user could not be found.'
            );

            return;
          }

          this.errorMessage.set(
            'The internal user could not be loaded. Please try again.'
          );
        }
      });
  }
}
