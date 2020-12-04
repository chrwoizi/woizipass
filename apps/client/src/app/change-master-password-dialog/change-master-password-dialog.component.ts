import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChangeMasterPassword } from '@woizpass/api-interfaces';

@Component({
  selector: 'woizpass-change-master-password-dialog',
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
    private http: HttpClient
  ) {}

  keyDown(event) {
    if (event.keyCode === 13) {
      this.submit();
    }
  }

  submit() {
    this.loading = true;

    const post$ = this.http.post('/api/change-master', {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    } as ChangeMasterPassword);

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
