import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../environments/environment';

interface SettingRow { key: string; value: string; description: string; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h1>Settings</h1>
    <mat-card class="card">
      @for (s of settings(); track s.key) {
        <div class="setting-row">
          <div class="meta">
            <div class="key">{{ s.key }}</div>
            <div class="desc">{{ s.description }}</div>
          </div>
          <mat-form-field appearance="outline" class="value-field">
            <input matInput [(ngModel)]="s.value" />
          </mat-form-field>
          <button mat-stroked-button color="primary" (click)="save(s)">Save</button>
        </div>
      } @empty {
        <p>Loading settings…</p>
      }
    </mat-card>
  `,
  styles: [`.card{padding:20px;max-width:800px}
    .setting-row{display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid #eee}
    .meta{flex:1}.key{font-weight:600;font-family:monospace}.desc{font-size:12px;color:#6b7280}
    .value-field{width:200px;margin-bottom:-1.25em}`]
})
export class SettingsComponent implements OnInit {
  readonly settings = signal<SettingRow[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ data: { rows: SettingRow[] } }>(`${environment.apiUrl}/settings`)
      .subscribe((res) => this.settings.set(res.data.rows));
  }

  save(s: SettingRow): void {
    this.http.put(`${environment.apiUrl}/settings`, { key: s.key, value: s.value }).subscribe();
  }
}
