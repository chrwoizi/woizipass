import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { createApiKey } from '@woizipass/crypto-client';
import { SessionService } from '../auth/session.service';

@Component({
  selector: 'woizipass-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.css'],
})
export class UploadDialogComponent {
  password: string;
  newPassword: string;
  hasFile = false;

  loading = false;
  error?: string;

  formData: FormData = new FormData();

  constructor(
    public dialogRef: MatDialogRef<UploadDialogComponent>,
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  setFile(event) {
    const files = event.srcElement.files;
    if (!files || files.length !== 1) {
      return;
    }

    this.formData.append('file', files[0], files[0].name);

    this.hasFile = true;
  }

  async submit() {
    if (!this.password || !this.newPassword || !this.hasFile) return;

    this.formData.append('key', await createApiKey(this.password));
    this.formData.append('newKey', await createApiKey(this.newPassword));

    this.loading = true;

    const post$ = this.http.post('/api/upload', this.formData);

    post$.subscribe(
      () => {
        this.loading = false;
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
  }
}
