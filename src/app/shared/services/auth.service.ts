import { Injectable, computed, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth: Auth;
  private readonly _user = signal<User | null>(null);
  private readonly _ready = signal(false);

  readonly user = this._user.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly displayName = computed(() => {
    const user = this._user();
    return user ? user.displayName || user.email || 'Account' : '';
  });

  // Resolve após o Firebase restaurar a sessão persistida, evitando redirecionar para o login por engano.
  readonly whenReady: Promise<void>;

  constructor() {
    this.auth = getAuth(initializeApp(environment.firebase));
    if (environment.authEmulatorUrl) {
      connectAuthEmulator(this.auth, environment.authEmulatorUrl, { disableWarnings: true });
    }

    this.whenReady = new Promise(resolve => {
      onAuthStateChanged(this.auth, user => {
        this._user.set(user);
        this._ready.set(true);
        resolve();
      });
    });
  }

  async login(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    this._user.set(credential.user);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this._user.set(null);
  }
}
