import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {
  GetPasswordResponse,
  WoizCredential,
  WoizCredentials,
} from '@woizipass/api-interfaces';
import { Observable } from 'rxjs';
import { DeleteCredentialDialogComponent } from '../delete-credential-dialog/delete-credential-dialog.component';
import { UpdateCredentialDialogComponent } from '../update-credential-dialog/update-credential-dialog.component';

interface WoizCredentialWithLoading extends WoizCredential {
  loading: boolean;
}

@Component({
  selector: 'woizipass-credential-table',
  templateUrl: './credential-table.component.html',
  styleUrls: ['./credential-table.component.css'],
})
export class CredentialTableComponent {
  dataSource: MatTableDataSource<WoizCredentialWithLoading>;
  observableData: Observable<WoizCredentialWithLoading[]>;
  loading = false;
  error: string;

  @Output() onUnauthorizedError = new EventEmitter<void>();

  constructor(private http: HttpClient, public dialog: MatDialog) {
    this.loading = true;
    this.reload();
  }

  private reload() {
    this.http.get<WoizCredentials>('/api/credential').subscribe(
      (response) => {
        this.loading = false;
        this.dataSource = new MatTableDataSource<WoizCredentialWithLoading>(
          response.credentials as WoizCredentialWithLoading[]
        );
        this.observableData = this.dataSource.connect();
      },
      (e) => {
        this.loading = false;
        if (e.status === 403) {
          this.onUnauthorizedError.emit();
        } else {
          this.error = e.message || e;
        }
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  create() {
    const dialogRef = this.createEditDialog();

    dialogRef.afterClosed().subscribe(() => {
      this.reload();
    });
  }

  edit(row: WoizCredential) {
    const dialogRef = this.createEditDialog();

    dialogRef.componentInstance.id = row.id;
    dialogRef.componentInstance.provider = row.provider;
    dialogRef.componentInstance.email = row.email;
    dialogRef.componentInstance.username = row.username;
    dialogRef.componentInstance.comment = row.comment;

    dialogRef.afterClosed().subscribe(() => this.reload());
  }

  private createEditDialog() {
    const dialogRef = this.dialog.open(UpdateCredentialDialogComponent, {
      restoreFocus: false,
    });

    dialogRef.componentInstance.providers = this.unique(
      this.dataSource.data
        .map((x) => x.provider)
        .filter((x) => typeof x === 'string' && x.length > 0)
    );

    dialogRef.componentInstance.emails = this.unique(
      this.dataSource.data
        .map((x) => x.email)
        .filter((x) => typeof x === 'string' && x.length > 0)
    );

    dialogRef.componentInstance.usernames = this.unique(
      this.dataSource.data
        .map((x) => x.username)
        .filter((x) => typeof x === 'string' && x.length > 0)
    );

    return dialogRef;
  }

  openDeleteDialog(row: WoizCredential) {
    const dialogRef = this.dialog.open(DeleteCredentialDialogComponent, {
      restoreFocus: false,
    });

    dialogRef.componentInstance.id = row.id;
    dialogRef.componentInstance.provider = row.provider;
    dialogRef.componentInstance.email = row.email;
    dialogRef.componentInstance.username = row.username;

    dialogRef.afterClosed().subscribe(() => {
      this.reload();
    });
  }

  unique(a) {
    return a.sort().filter(function (value, index, array) {
      return index === 0 || value !== array[index - 1];
    });
  }

  show(credential: WoizCredentialWithLoading) {
    credential.loading = true;
    const response$ = this.http.get<GetPasswordResponse>(
      '/api/credential/' + credential.id
    );

    response$.subscribe(
      (response) => {
        credential.loading = false;
        credential.password = response.password;
      },
      (e) => {
        credential.loading = false;
      }
    );
  }

  hide(credential: WoizCredentialWithLoading) {
    credential.password = undefined;
  }

  copy(credential: WoizCredentialWithLoading) {
    if (credential.password) {
      this.copyText(credential.password);
      return;
    }

    credential.loading = true;
    const response$ = this.http.get<GetPasswordResponse>(
      '/api/credential/' + credential.id
    );

    response$.subscribe(
      (response) => {
        credential.loading = false;
        this.copyText(response.password);
      },
      (e) => {
        credential.loading = false;
      }
    );
  }

  private copyText(text) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
