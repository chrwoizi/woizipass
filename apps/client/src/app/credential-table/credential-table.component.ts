import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  GetPasswordResponse,
  WoizCredential,
  WoizCredentials,
} from '@woizpass/api-interfaces';
import { ChangeMasterPasswordDialogComponent } from '../change-master-password-dialog/change-master-password-dialog.component';
import { DeleteCredentialDialogComponent } from '../delete-credential-dialog/delete-credential-dialog.component';
import { UpdateCredentialDialogComponent } from '../update-credential-dialog/update-credential-dialog.component';

@Component({
  selector: 'woizpass-credential-table',
  templateUrl: './credential-table.component.html',
  styleUrls: ['./credential-table.component.css'],
})
export class CredentialTableComponent {
  displayedColumns: string[] = [
    'provider',
    'email',
    'username',
    'password',
    'buttons',
  ];

  dataSource: MatTableDataSource<WoizCredential>;
  loading = false;
  error: string;

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Output() onUnauthorizedError = new EventEmitter<void>();

  constructor(private http: HttpClient, public dialog: MatDialog) {
    this.loading = true;
    this.reload();
  }

  private reload() {
    this.http.get<WoizCredentials>('/api/credential').subscribe(
      (response) => {
        this.loading = false;
        this.dataSource = new MatTableDataSource<WoizCredential>(
          response.credentials
        );
        this.dataSource.sort = this.sort;
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

    dialogRef.afterClosed().subscribe(() => this.reload());
  }

  private createEditDialog() {
    const dialogRef = this.dialog.open(UpdateCredentialDialogComponent, {
      restoreFocus: false,
    });

    dialogRef.componentInstance.providers = this.unique(
      this.dataSource.data.map((x) => x.provider)
    );

    dialogRef.componentInstance.emails = this.unique(
      this.dataSource.data.map((x) => x.email)
    );

    dialogRef.componentInstance.usernames = this.unique(
      this.dataSource.data.map((x) => x.username)
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

  show(credential: WoizCredential) {
    this.loading = true;
    const response$ = this.http.get<GetPasswordResponse>(
      '/api/credential/' + credential.id
    );

    response$.subscribe(
      (response) => {
        this.loading = false;
        credential.password = response.password;
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  hide(credential: WoizCredential) {
    credential.password = undefined;
  }

  copy(credential: WoizCredential) {
    if (credential.password) {
      this.copyText(credential.password);
      return;
    }

    this.loading = true;
    const response$ = this.http.get<GetPasswordResponse>(
      '/api/credential/' + credential.id
    );

    response$.subscribe(
      (response) => {
        this.loading = false;
        this.copyText(response.password);
      },
      (e) => {
        this.loading = false;
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
