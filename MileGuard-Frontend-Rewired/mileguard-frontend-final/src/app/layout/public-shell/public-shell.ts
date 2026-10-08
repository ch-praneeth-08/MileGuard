import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicShell {}
