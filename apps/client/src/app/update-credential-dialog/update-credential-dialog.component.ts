import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { WoizCredential } from '@woizipass/api-interfaces';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SessionService } from '../auth/session.service';

@Component({
  selector: 'woizipass-update-credential-dialog',
  templateUrl: './update-credential-dialog.component.html',
  styleUrls: ['./update-credential-dialog.component.css'],
})
export class UpdateCredentialDialogComponent {
  id: string;
  provider: string;
  email: string;
  username: string;
  password: string;
  changePassword = false;
  comment: string;

  loading = false;
  error?: string;

  providerControl = new FormControl();
  providers: string[] = [];
  filteredProviders: Observable<string[]>;

  emailControl = new FormControl();
  emails: string[] = [];
  filteredEmails: Observable<string[]>;

  usernameControl = new FormControl();
  usernames: string[] = [];
  filteredUsernames: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<UpdateCredentialDialogComponent>,
    private http: HttpClient,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.filteredProviders = this.providerControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterProviders(value))
    );

    this.filteredEmails = this.emailControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterEmails(value))
    );

    this.filteredUsernames = this.usernameControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterUsernames(value))
    );
  }

  private filterProviders(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.providers.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private filterEmails(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.emails.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private filterUsernames(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.usernames.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  submit() {
    if (!this.provider) return;

    this.loading = true;

    const post$ = this.http.post('/api/credential', {
      id: this.id,
      provider: this.provider,
      email: this.email,
      username: this.username,
      password:
        this.changePassword || !this.id
          ? this.sessionService.encryptWithClientKey(this.password)
          : undefined,
      comment: this.comment,
    } as WoizCredential);

    post$.subscribe(
      () => {
        this.dialogRef.close(true);
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
