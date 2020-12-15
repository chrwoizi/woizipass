import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { shareReplay, tap, catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthRequest } from '@woizipass/api-interfaces';
import {
  createApiKey,
  createClientKey,
  decrypt,
  encrypt,
} from '@woizipass/crypto-client';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _changeSubject = new Subject<boolean>();
  change$ = this._changeSubject.asObservable();

  constructor(private http: HttpClient) {}

  async login(password: string) {
    this.setClientKey(await createClientKey(password));

    const apiKey = await createApiKey(password);

    return this.http
      .post('/api/login', {
        username: 'woizipass',
        password: apiKey,
      } as AuthRequest)
      .pipe(
        tap((res) => this.setSession(res)),
        shareReplay()
      );
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

  private setSession(authResult: any) {
    const tokenData = this.parseJwt(authResult.idToken);

    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', tokenData.exp);
    this._changeSubject.next(this.isLoggedIn());
  }

  onUnauthorized() {
    localStorage.removeItem('client_key');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
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
    return moment().isBefore(this.getExpiration());
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment.unix(expiresAt);
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
