import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ChangeMasterPasswordDialogComponent } from './change-master-password-dialog/change-master-password-dialog.component';
import { SessionService } from './auth/session.service';
import { CredentialTableComponent } from './credential-table/credential-table.component';

@Component({
  selector: 'woizpass-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  unauthorized = false;
  masterPassword: string;
  loading = false;
  error: string;

  @ViewChild(CredentialTableComponent, { static: false })
  credentialTable: CredentialTableComponent;

  constructor(
    public dialog: MatDialog,
    readonly sessionService: SessionService,
    readonly http: HttpClient
  ) {
    this.unauthorized = !this.sessionService.isLoggedIn();
  }

  onUnauthorizedError() {
    this.unauthorized = true;
  }

  openChangeMasterPasswordDialog() {
    this.dialog.open(ChangeMasterPasswordDialogComponent, {
      restoreFocus: false,
    });
  }

  masterPasswordKeyDown(event) {
    if (event.keyCode === 13) {
      this.login();
    }
  }

  create() {
    this.credentialTable.create();
  }

  login() {
    this.loading = true;

    this.sessionService.login(this.masterPassword).subscribe(
      () => {
        this.loading = false;
        this.masterPassword = undefined;
        this.unauthorized = false;
        this.error = undefined;
      },
      (e) => {
        this.loading = false;
        this.masterPassword = undefined;
        this.unauthorized = true;
        this.error = e.message || e;
      }
    );
  }

  logout() {
    this.sessionService.logout().subscribe(
      () => {
        this.unauthorized = true;
      },
      (e) => {
        this.unauthorized = true;
        this.error = e.message || e;
      }
    );
  }

  backup() {
    this.loading = true;

    const get$ = this.http.get('/api/file', {
      responseType: 'arraybuffer',
    });

    get$.subscribe(
      (data) => {
        this.loading = false;
        const anchor = document.createElement('a');
        const blob = new Blob([data]);
        anchor.href = window.URL.createObjectURL(blob);
        anchor.download = 'credentials.aes';
        anchor.click();
      },
      (e) => {
        this.loading = false;
        this.error = e.message || e;
      }
    );
  }
}
