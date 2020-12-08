import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

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
    private http: HttpClient
  ) {}

  submit() {
    this.loading = true;

    const del$ = this.http.delete('/api/credential/' + this.id);

    del$.subscribe(
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
