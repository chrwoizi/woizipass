import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DownloadRequest, UploadTextRequest } from '@woizipass/api-interfaces';
import { SessionService } from '../auth/session.service';
import {
  createApiKey,
  createClientKey,
  decrypt,
  encrypt,
} from '@woizipass/crypto-client';

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

  async submit() {
    if (!this.oldPassword || !this.newPassword) return;

    this.loading = true;

    const oldApiKey = await createApiKey(this.oldPassword);
    const oldClientKey = await createClientKey(this.oldPassword);

    const newApiKey = await createApiKey(this.newPassword);
    const newClientKey = await createClientKey(this.newPassword);

    const post$ = this.http.post(
      '/api/download-text',
      {
        key: oldApiKey,
      } as DownloadRequest,
      { responseType: 'text' }
    );

    post$.subscribe(
      async (oldEncrypted) => {
        const json = decrypt(oldEncrypted, oldApiKey);

        if (!json?.startsWith('[')) {
          this.loading = false;
          this.error = 'Incorrect password.';
          return;
        }

        const credentials = JSON.parse(json);

        for (const credential of credentials) {
          credential.password = decrypt(credential.password, oldClientKey);

          credential.password = encrypt(credential.password, newClientKey);
        }

        const newEncrypted = encrypt(JSON.stringify(credentials), newApiKey);

        const post$ = this.http.post('/api/upload-text', {
          key: await createApiKey(this.oldPassword),
          newKey: await createApiKey(this.newPassword),
          text: newEncrypted,
        } as UploadTextRequest);

        post$.subscribe(
          () => {
            this.sessionService.logout().subscribe();
            this.dialogRef.close();
          },
          (e) => {
            this.loading = false;
            if (e.status === 403) {
              this.sessionService.onUnauthorized();
            } else {
              this.error = e.message || e;
            }
          }
        );
      },
      (e) => {
        this.loading = false;
        if (e.status === 403) {
          this.sessionService.onUnauthorized();
        } else {
          this.error = e.message || e;
        }
      }
    );
  }
}
