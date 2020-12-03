import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@woizpass/api-interfaces';

@Component({
  selector: 'woizpass-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  hello$ = this.http.get<Message>('/api/hello');
  constructor(private http: HttpClient) {}
}
