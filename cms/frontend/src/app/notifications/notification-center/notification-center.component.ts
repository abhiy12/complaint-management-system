import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

interface Notification { id: number; title: string; message: string; is_read: boolean; created_at: string; }

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  template: `
    <h1>Notifications</h1>
    <mat-nav-list>
      @for (n of notifications(); track n.id) {
        <mat-list-item [class.unread]="!n.is_read">
          <mat-icon matListItemIcon>{{ n.is_read ? 'mail_outline' : 'mark_email_unread' }}</mat-icon>
          <div matListItemTitle>{{ n.title }}</div>
          <div matListItemLine>{{ n.message }}</div>
        </mat-list-item>
      } @empty {
        <p>No notifications yet.</p>
      }
    </mat-nav-list>
  `,
  styles: [`.unread { font-weight: 600; background: #eef1fb; }`]
})
export class NotificationCenterComponent implements OnInit {
  readonly notifications = signal<Notification[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ data: Notification[] }>(`${environment.apiUrl}/notifications`)
      .subscribe((res) => this.notifications.set(res.data));
  }
}
