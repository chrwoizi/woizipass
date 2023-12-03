import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {
  GetPasswordResponse,
  WoizCredential,
  WoizCredentials,
} from '@woizipass/api-interfaces';
import { Observable } from 'rxjs';
import { SessionService } from '../auth/session.service';
import { DeleteCredentialDialogComponent } from '../delete-credential-dialog/delete-credential-dialog.component';
import { UpdateCredentialDialogComponent } from '../update-credential-dialog/update-credential-dialog.component';
import { MatSort } from '@angular/material/sort';

interface WoizCredentialViewModel extends WoizCredential {
  loading: boolean;
}

@Component({
  selector: 'woizipass-credential-table',
  templateUrl: './credential-table.component.html',
  styleUrls: ['./credential-table.component.css'],
})
export class CredentialTableComponent {
  dataSource: MatTableDataSource<WoizCredentialViewModel>;
  observableData: Observable<WoizCredentialViewModel[]>;
  loading = false;
  error: string;

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private sessionService: SessionService
  ) {
    this.reload();
  }

  private reload() {
    this.loading = true;
    this.http.get<WoizCredentials>('/api/credential').subscribe(
      (response) => {
        this.loading = false;
        this.dataSource = new MatTableDataSource<WoizCredentialViewModel>(
          response.credentials as WoizCredentialViewModel[]
        );

        this.dataSource.sortingDataAccessor = (item, property) => {
          switch (property) {
            case 'accessedAt':
              return item.accessedAt;
            case 'provider':
              return item.provider;
            case 'email':
              return item.email;
            case 'username':
              return item.username;
            default:
              return item[property];
          }
        };

        this.dataSource.sort = new MatSort();

        const sortValue = localStorage.getItem('credential-table-sort');
        if (sortValue) {
          this.dataSource.sort.sort({
            id: sortValue,
            start: sortValue === 'accessedAt' ? 'desc' : 'asc',
            disableClear: false,
          });
        } else {
          this.dataSource.sort.sort({
            id: 'accessedAt',
            start: 'desc',
            disableClear: false,
          });
        }

        this.observableData = this.dataSource.connect();
        this.sessionService.resetTtl();
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

  applySort(event: Event) {
    const sortValue = (event.target as HTMLInputElement).value;
    this.dataSource.sort.sort({
      id: sortValue,
      start: sortValue === 'accessedAt' ? 'desc' : 'asc',
      disableClear: false,
    });
    localStorage.setItem('credential-table-sort', sortValue);
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
    dialogRef.componentInstance.url = row.url;

    dialogRef.afterClosed().subscribe((success: boolean) => {
      if (success) this.reload();
    });
  }

  private createEditDialog() {
    const dialogRef = this.dialog.open(UpdateCredentialDialogComponent, {
      restoreFocus: false,
    });

    function count(item, list) {
      return list.filter((x) => x === item).length;
    }

    const providers = this.dataSource.data
      .map((x) => x.provider)
      .filter((x) => typeof x === 'string' && x.length > 0);
    dialogRef.componentInstance.providers = this.unique(providers).sort(
      (a, b) => count(b, providers) - count(a, providers)
    );

    const emails = this.dataSource.data
      .map((x) => x.email)
      .filter((x) => typeof x === 'string' && x.length > 0);
    dialogRef.componentInstance.emails = this.unique(emails).sort(
      (a, b) => count(b, emails) - count(a, emails)
    );

    const usernames = this.dataSource.data
      .map((x) => x.username)
      .filter((x) => typeof x === 'string' && x.length > 0);
    dialogRef.componentInstance.usernames = this.unique(usernames).sort(
      (a, b) => count(b, usernames) - count(a, usernames)
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

    dialogRef.afterClosed().subscribe((success: boolean) => {
      if (success) this.reload();
    });
  }

  unique(a) {
    return a.sort().filter(function (value, index, array) {
      return index === 0 || value !== array[index - 1];
    });
  }

  show(credential: WoizCredentialViewModel) {
    credential.loading = true;
    const response$ = this.http.get<GetPasswordResponse>(
      '/api/credential/' + credential.id
    );

    response$.subscribe(
      (response) => {
        credential.loading = false;
        credential.password = this.sessionService.decryptWithClientKey(
          response.password
        );
        this.sessionService.resetTtl();
      },
      (e) => {
        credential.loading = false;
        if (e.status === 403) {
          this.sessionService.onUnauthorized();
        } else {
          this.error = e.message || e;
        }
      }
    );
  }

  hide(credential: WoizCredentialViewModel) {
    credential.password = undefined;
  }

  copy(credential: WoizCredentialViewModel) {
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
        this.copyText(
          this.sessionService.decryptWithClientKey(response.password)
        );
        this.sessionService.resetTtl();
      },
      (e) => {
        credential.loading = false;
        if (e.status === 403) {
          this.sessionService.onUnauthorized();
        } else {
          this.error = e.message || e;
        }
      }
    );
  }

  copyUsername(credential: WoizCredentialViewModel) {
    this.copyText(credential.username ?? '');
  }

  copyEmail(credential: WoizCredentialViewModel) {
    this.copyText(credential.email ?? '');
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
