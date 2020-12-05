import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WoizCredentials } from '@woizpass/api-interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SetPasswordDialogComponent } from './set-password-dialog/set-password-dialog.component';
import { WoizCredentialViewModel } from './WoizCredentialViewModel';
import { ChangeMasterPasswordDialogComponent } from './change-master-password-dialog/change-master-password-dialog.component';
import { DeleteCredentialDialogComponent } from './delete-credential-dialog/delete-credential-dialog.component';
import { SessionService } from './auth/session.service';

@Component({
  selector: 'woizpass-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  displayedColumns: string[] = ['provider', 'username', 'password', 'buttons'];

  dataSource: MatTableDataSource<WoizCredentialViewModel>;
  loading = false;
  error: string;
  unauthorized = false;
  masterPassword: string;

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  response$ = this.http.get<WoizCredentials>('/api/credential');
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    readonly sessionService: SessionService
  ) {
    if (this.sessionService.isLoggedIn()) {
      this.loading = true;
      this.reload();
    } else {
      this.unauthorized = true;
    }
  }

  private reload() {
    this.response$.subscribe(
      (response) => {
        this.loading = false;
        this.dataSource = new MatTableDataSource<WoizCredentialViewModel>(
          response.credentials.map((credential) => {
            return new WoizCredentialViewModel(this.http, credential);
          })
        );
        this.dataSource.sort = this.sort;
      },
      (e) => {
        this.loading = false;
        if (e.status === 403) {
          this.unauthorized = true;
        } else {
          this.error = e.message || e;
          console.log(e);
        }
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openSetPasswordDialog(row: WoizCredentialViewModel) {
    const dialogRef = this.dialog.open(SetPasswordDialogComponent, {
      restoreFocus: false,
    });

    dialogRef.componentInstance.id = row.credential.id;
    dialogRef.componentInstance.provider = row.credential.provider;
    dialogRef.componentInstance.username = row.credential.username;
  }

  openChangeMasterPasswordDialog() {
    this.dialog.open(ChangeMasterPasswordDialogComponent, {
      restoreFocus: false,
    });
  }

  openDeleteDialog(row: WoizCredentialViewModel) {
    const dialogRef = this.dialog.open(DeleteCredentialDialogComponent, {
      restoreFocus: false,
    });

    dialogRef.componentInstance.id = row.credential.id;
    dialogRef.componentInstance.provider = row.credential.provider;
    dialogRef.componentInstance.username = row.credential.username;

    dialogRef.afterClosed().subscribe(() => {
      this.reload();
    });
  }

  create() {
    const dialogRef = this.dialog.open(SetPasswordDialogComponent, {
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.reload();
    });
  }

  masterPasswordKeyDown(event) {
    if (event.keyCode === 13) {
      this.login();
    }
  }

  login() {
    this.loading = true;

    this.sessionService.login(this.masterPassword).subscribe(
      () => {
        this.masterPassword = undefined;
        this.unauthorized = false;
        this.error = undefined;
        this.reload();
      },
      (e) => {
        this.loading = false;
        this.masterPassword = undefined;
        this.unauthorized = true;
        this.error = e.message || e;
      }
    );
  }

  logout() {
    this.sessionService.logout().subscribe(
      () => {
        this.unauthorized = true;
      },
      (e) => {
        this.unauthorized = true;
        this.error = e.message || e;
      }
    );
  }
}
