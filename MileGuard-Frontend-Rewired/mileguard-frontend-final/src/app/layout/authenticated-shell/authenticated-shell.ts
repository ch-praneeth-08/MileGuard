import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authenticated-shell',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './authenticated-shell.html',
  styleUrl: './authenticated-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthenticatedShell {}
