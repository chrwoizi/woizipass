import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { shareReplay, tap, catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _changeSubject = new Subject<boolean>();
  change$ = this._changeSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(password: string) {
    return this.http
      .post('/api/login', { username: 'woizipass', password })
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

  logout() {
    return this.http.post('/api/logout', {}).pipe(
      catchError((e) => {
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        this._changeSubject.next(false);
        throw e;
      }),
      tap(() => {
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        this._changeSubject.next(false);
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
}
