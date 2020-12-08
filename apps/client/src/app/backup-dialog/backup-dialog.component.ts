import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'woizipass-backup-dialog',
  templateUrl: './backup-dialog.component.html',
  styleUrls: ['./backup-dialog.component.css'],
})
export class BackupDialogComponent {
  password: string;

  loading = false;
  error?: string;

  constructor(
    public dialogRef: MatDialogRef<BackupDialogComponent>,
    private http: HttpClient
  ) {}

  submit() {
    if (!this.password) return;

    this.loading = true;

    this.loading = true;

    const post$ = this.http.post(
      '/api/file',
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
