import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'woizipass-download-dialog',
  templateUrl: './download-dialog.component.html',
  styleUrls: ['./download-dialog.component.css'],
})
export class DownloadDialogComponent {
  password: string;

  loading = false;
  error?: string;

  constructor(
    public dialogRef: MatDialogRef<DownloadDialogComponent>,
    private http: HttpClient
  ) {}

  submit() {
    if (!this.password) return;

    this.loading = true;

    const post$ = this.http.post(
      '/api/download',
      { password: this.password },
      {
        responseType: 'arraybuffer',
      }
    );

    post$.subscribe(
      (data) => {
        this.loading = false;
        const anchor = document.createElement('a');
        const blob = new Blob([data]);
        anchor.href = window.URL.createObjectURL(blob);
        anchor.download = 'credentials.aes';
        anchor.click();
        this.dialogRef.close();
      },
      (e) => {
        this.loading = false;
        this.error = e.message || e;
      }
    );
  }
}
