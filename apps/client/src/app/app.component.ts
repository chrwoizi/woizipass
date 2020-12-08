import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ChangeMasterPasswordDialogComponent } from './change-master-password-dialog/change-master-password-dialog.component';
import { SessionService } from './auth/session.service';
import { CredentialTableComponent } from './credential-table/credential-table.component';
import { BackupDialogComponent } from './backup-dialog/backup-dialog.component';

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
    this.dialog.open(BackupDialogComponent, {
      restoreFocus: false,
    });
  }
}
