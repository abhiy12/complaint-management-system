import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthUser } from '../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <h1>My Profile</h1>
    @if (profile(); as p) {
      <mat-card class="card">
        <p><strong>Name:</strong> {{ p.name }}</p>
        <p><strong>Email:</strong> {{ p.email }}</p>
        <p><strong>Role:</strong> {{ p.role_name }}</p>
      </mat-card>
    }
  `,
  styles: [`.card{padding:20px;max-width:500px}`]
})
export class ProfileComponent implements OnInit {
  readonly profile = signal<any>(null);
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get<{ data: any }>(`${environment.apiUrl}/auth/profile`).subscribe((res) => this.profile.set(res.data));
  }
}
