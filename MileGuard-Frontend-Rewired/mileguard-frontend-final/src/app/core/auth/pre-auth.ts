import { Injectable, signal } from '@angular/core';

export interface PreAuthState {
  token: string;
  email: string;
  role: string;
  requiresSetup: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PreAuth {
  private readonly stateSignal =
    signal<PreAuthState | null>(null);

  readonly state =
    this.stateSignal.asReadonly();

  set(state: PreAuthState): void {
    this.stateSignal.set(state);
  }

  clear(): void {
    this.stateSignal.set(null);
  }
}
