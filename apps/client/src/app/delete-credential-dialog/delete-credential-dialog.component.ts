import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SessionService } from '../auth/session.service';

@Component({
  selector: 'woizipass-delete-credential-dialog',
  templateUrl: './delete-credential-dialog.component.html',
  styleUrls: ['./delete-credential-dialog.component.css'],
})
export class DeleteCredentialDialogComponent {
  id: string;
  provider: string;
  email: string;
  username: string;
  password: string;

  loading = false;
  error?: string;

  constructor(
    public dialogRef: MatDialogRef<DeleteCredentialDialogComponent>,
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  submit() {
    this.loading = true;

    const del$ = this.http.delete('/api/credential/' + this.id);

    del$.subscribe(
      () => {
        this.dialogRef.close(true);
        this.sessionService.resetTtl();
      },
      (e) => {
        this.loading = false;
        if (e.status === 403) {
          this.sessionService.onUnauthorized();
          this.dialogRef.close();
        } else {
          this.error = e.message || e;
        }
      }
    );
  }
}
