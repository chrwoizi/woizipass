import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'woizpass-update-credential-dialog',
  templateUrl: './update-credential-dialog.component.html',
  styleUrls: ['./update-credential-dialog.component.css'],
})
export class UpdateCredentialDialogComponent {
  id: string;
  provider: string;
  username: string;
  password: string;

  loading = false;
  error?: string;

  constructor(
    public dialogRef: MatDialogRef<UpdateCredentialDialogComponent>,
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
