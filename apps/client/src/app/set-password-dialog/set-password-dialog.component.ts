import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'woizpass-set-password-dialog',
  templateUrl: './set-password-dialog.component.html',
  styleUrls: ['./set-password-dialog.component.css'],
})
export class SetPasswordDialogComponent {
  id: string;
  provider: string;
  username: string;
  password: string;

  loading = false;
  error?: string;

  constructor(
    public dialogRef: MatDialogRef<SetPasswordDialogComponent>,
    private http: HttpClient
  ) {}

  keyDown(event) {
    if (event.keyCode === 13) {
      this.submit();
    }
  }

  submit() {
    this.loading = true;

    const post$ = this.http.post('/api/credential', {
      id: this.id,
      provider: this.provider,
      username: this.username,
      password: this.password,
    });

    post$.subscribe(
      () => {
        this.dialogRef.close();
      },
      (e) => {
        this.loading = false;
        this.error = e.message || e;
      }
    );
  }
}
