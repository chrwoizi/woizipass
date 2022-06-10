import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ChangeMasterPasswordDialogComponent } from './change-master-password-dialog/change-master-password-dialog.component';
import { SessionService } from './auth/session.service';
import { CredentialTableComponent } from './credential-table/credential-table.component';
import { DownloadDialogComponent } from './download-dialog/download-dialog.component';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';

@Component({
  selector: 'woizipass-root',
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
    this.sessionService.change$.subscribe(() => {
      this.unauthorized = !this.sessionService.isLoggedIn();
    });
    setInterval(() => {
      if (this.sessionService.isLoggedIn()) {
        this.sessionService.ping();
      }
    }, 1000);
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

  async login() {
    this.loading = true;

    const login$ = await this.sessionService.login(this.masterPassword);
    login$.subscribe(
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

  download() {
    this.dialog.open(DownloadDialogComponent, {
      restoreFocus: false,
    });
  }

  upload() {
    this.dialog.open(UploadDialogComponent, {
      restoreFocus: false,
    });
  }
}
