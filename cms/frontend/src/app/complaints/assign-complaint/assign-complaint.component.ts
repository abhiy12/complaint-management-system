import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ComplaintService } from '../../core/services/complaint.service';
import { ExecutiveService } from '../../core/services/executive.service';
import { Executive } from '../../core/models/executive.model';

@Component({
  selector: 'app-assign-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatSelectModule, MatFormFieldModule, MatButtonModule],
  template: `
    <h1>Assign Complaint #{{ complaintId }}</h1>
    <mat-card class="card">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Available Executive</mat-label>
        <mat-select [(ngModel)]="selectedExecutiveId">
          @for (e of executives(); track e.id) {
            <mat-option [value]="e.id" [disabled]="e.is_on_leave">
              {{ e.name }} — {{ e.zone }} {{ e.is_on_leave ? '(on leave)' : '' }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button mat-flat-button color="primary" [disabled]="!selectedExecutiveId" (click)="assign()">Assign</button>
    </mat-card>
  `,
  styles: [`.card{padding:24px;max-width:500px}.full-width{width:100%}`]
})
export class AssignComplaintComponent implements OnInit {
  readonly executives = signal<Executive[]>([]);
  selectedExecutiveId: number | null = null;
  complaintId!: number;

  constructor(
    private route: ActivatedRoute, private router: Router,
    private complaintService: ComplaintService, private executiveService: ExecutiveService
  ) {}

  ngOnInit(): void {
    this.complaintId = Number(this.route.snapshot.paramMap.get('id'));
    // availableOnly filters to current_status='available' AND is_on_leave=0 server-side;
    // we still show on-leave executives disabled here for transparency.
    this.executiveService.list({ availableOnly: 'true' }).subscribe((res) => this.executives.set(res.data.rows));
  }

  assign(): void {
    if (!this.selectedExecutiveId) return;
    this.complaintService.assign(this.complaintId, this.selectedExecutiveId).subscribe(() => {
      this.router.navigate(['/admin/complaints', this.complaintId]);
    });
  }
}
