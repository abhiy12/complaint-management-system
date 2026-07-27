import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ComplaintService } from '../../core/services/complaint.service';
import { Complaint } from '../../core/models/complaint.model';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  template: `
    <div class="header-row">
      <h1>My Complaints</h1>
      <a mat-flat-button color="primary" routerLink="/vendor/complaints/new">+ Raise Complaint</a>
    </div>
    <div class="grid">
      @for (c of complaints(); track c.id) {
        <mat-card class="card">
          <h3>{{ c.complaint_number }}</h3>
          <p>{{ c.subject }}</p>
          <span class="status-badge">{{ c.status }}</span>
        </mat-card>
      } @empty {
        <p>No complaints raised yet.</p>
      }
    </div>
  `,
  styles: [`.header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
    .card{padding:16px}`]
})
export class VendorDashboardComponent implements OnInit {
  readonly complaints = signal<Complaint[]>([]);
  constructor(private complaintService: ComplaintService) {}
  ngOnInit(): void { this.complaintService.list().subscribe((res) => this.complaints.set(res.data.rows)); }
}
