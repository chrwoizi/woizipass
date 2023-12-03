import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthRequest, AuthResponse } from '@woizipass/api-interfaces';
import {
  createApiKey,
  createClientKey,
  decrypt,
  encrypt,
} from '@woizipass/crypto-client';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _changeSubject = new Subject<boolean>();
  change$ = this._changeSubject.asObservable();

  public ttl: number;
  private isLoggingIn: boolean;

  constructor(private http: HttpClient) {}

  async login(password: string) {
    this.isLoggingIn = true;
    this.setClientKey(await createClientKey(password));

    const apiKey = await createApiKey(password);

    return this.http
      .post('/api/login', {
        username: 'woizipass',
        password: apiKey,
      } as AuthRequest)
      .pipe(
        tap((res: AuthResponse) => {
          this.setSession(res);
          this.isLoggingIn = false;
        }),
        catchError((e) => {
          this.isLoggingIn = false;
          this.onUnauthorized();
          throw e;
        }),
        shareReplay()
      );
  }

  ping() {
    this.http
      .get('/api/ping')
      .pipe(
        catchError((e) => {
          if (e.status === 403) {
            this.onUnauthorized();
          }
          throw e;
        }),
        tap(() => {
          this.resetTtl();
        }),
        shareReplay()
      )
      .subscribe();
  }

  resetTtl() {
    const expiresAt = localStorage.getItem('unlock_expires_at');
    const ttl = localStorage.getItem('ttl');
    if (expiresAt && ttl) {
      localStorage.setItem(
        'unlock_expires_at',
        (new Date().getTime() + 1000 * parseInt(ttl)).toString()
      );
    }
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private setSession(authResult: AuthResponse) {
    const jwt = this.parseJwt(authResult.idToken);
    this.ttl = authResult.ttl;
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('ttl', authResult.ttl.toString());
    localStorage.setItem('jwt_expires_at', (1000 * jwt.exp).toString());
    localStorage.setItem(
      'unlock_expires_at',
      (new Date().getTime() + 1000 * authResult.ttl).toString()
    );
    this._changeSubject.next(this.isLoggedIn());
  }

  onUnauthorized() {
    if (this.isLoggingIn) {
      return;
    }
    localStorage.removeItem('client_key');
    localStorage.removeItem('id_token');
    localStorage.removeItem('ttl');
    localStorage.removeItem('jwt_expires_at');
    localStorage.removeItem('unlock_expires_at');
    this._changeSubject.next(false);
  }

  logout() {
    return this.http.post('/api/logout', {}).pipe(
      catchError((e) => {
        this.onUnauthorized();
        throw e;
      }),
      tap(() => {
        this.onUnauthorized();
      }),
      shareReplay()
    );
  }

  public isLoggedIn() {
    return moment().isBefore(this.getJwtExpiresAt()) && moment().isBefore(this.getUnlockExpiresAt());
  }

  getJwtExpiresAt() {
    const expiration = localStorage.getItem('jwt_expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(new Date(expiresAt));
  }

  getUnlockExpiresAt() {
    const expiration = localStorage.getItem('unlock_expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(new Date(expiresAt));
  }

  private setClientKey(clientKey: string) {
    localStorage.setItem('client_key', clientKey);
  }

  private getClientKey(): string {
    return localStorage.getItem('client_key');
  }

  encryptWithClientKey(cleartext: string): string {
    const clientKey = this.getClientKey();
    if (!clientKey) {
      throw new Error('Password not set');
    }

    return encrypt(cleartext, clientKey);
  }

  decryptWithClientKey(cipher: string): string {
    const clientKey = this.getClientKey();
    if (!clientKey) {
      throw new Error('Password not set');
    }

    return decrypt(cipher, clientKey);
  }
}
