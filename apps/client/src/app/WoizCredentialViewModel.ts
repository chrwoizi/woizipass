import { HttpClient } from '@angular/common/http';
import { GetPasswordResponse, WoizCredential } from '@woizpass/api-interfaces';

export class WoizCredentialViewModel {
  password?: string;
  loading = false;

  constructor(private http: HttpClient, public credential: WoizCredential) {}

  show() {
    this.loading = true;
    const response$ = this.http.get<GetPasswordResponse>(
      '/api/credential/' + this.credential.id
    );

    response$.subscribe(
      (response) => {
        this.loading = false;
        this.password = response.password;
      },
      (e) => {
        this.loading = false;
      }
    );
  }

  hide() {
    this.password = undefined;
  }

  copy() {
    if (this.password) {
      this.copyText(this.password);
      return;
    }

    this.loading = true;
    const response$ = this.http.get<GetPasswordResponse>(
      '/api/credential/' + this.credential.id
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
