import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {
  ChangeMasterPassword,
  DownloadRequest,
  UploadTextRequest,
} from '@woizipass/api-interfaces';
import { SessionService } from '../auth/session.service';
import { SHA256, AES, enc } from 'crypto-js';

@Component({
  selector: 'woizipass-change-master-password-dialog',
  templateUrl: './change-master-password-dialog.component.html',
  styleUrls: ['./change-master-password-dialog.component.css'],
})
export class ChangeMasterPasswordDialogComponent {
  oldPassword: string;
  newPassword: string;

  loading = false;
  error?: string;

  constructor(
    public dialogRef: MatDialogRef<ChangeMasterPasswordDialogComponent>,
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  submit() {
    if (!this.oldPassword || !this.newPassword) return;

    this.loading = true;

    const oldApiKey = this.sessionService.createApiKey(this.oldPassword);
    const oldClientKey = this.sessionService.createClientKey(this.oldPassword);

    const newApiKey = this.sessionService.createApiKey(this.newPassword);
    const newClientKey = this.sessionService.createClientKey(this.newPassword);

    const post$ = this.http.post(
      '/api/download-text',
      {
        key: oldApiKey,
      } as DownloadRequest,
      { responseType: 'text' }
    );

    post$.subscribe(
      (oldEncrypted) => {
        const json = AES.decrypt(oldEncrypted, oldApiKey).toString(enc.Utf8);

        if (!json?.startsWith('[')) {
          this.loading = false;
          this.error = 'Incorrect password.';
          return;
        }

        const credentials = JSON.parse(json);

        for (const credential of credentials) {
          credential.password = AES.decrypt(
            credential.password,
            oldClientKey
          ).toString(enc.Utf8);

          credential.password = AES.encrypt(
            credential.password,
            newClientKey
          ).toString();
        }

        const newEncrypted = AES.encrypt(
          JSON.stringify(credentials),
          newApiKey
        ).toString();

        const post$ = this.http.post('/api/upload-text', {
          key: this.sessionService.createApiKey(this.oldPassword),
          newKey: this.sessionService.createApiKey(this.newPassword),
          text: newEncrypted,
        } as UploadTextRequest);

        post$.subscribe(
          () => {
            this.sessionService.logout().subscribe();
            this.dialogRef.close();
          },
          (e) => {
            this.loading = false;
            this.error = e.message || e;
          }
        );
      },
      (e) => {
        this.loading = false;
        this.error = e.message || e;
      }
    );
  }
}
