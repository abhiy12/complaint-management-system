import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../core/services/complaint.service';
import { Complaint, ComplaintHistoryEntry, ComplaintStatus } from '../../core/models/complaint.model';
import { ComplaintTimelineComponent } from '../complaint-timeline/complaint-timeline.component';

@Component({
  selector: 'app-complaint-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatSelectModule, MatFormFieldModule, ComplaintTimelineComponent],
  templateUrl: './complaint-details.component.html',
  styleUrl: './complaint-details.component.scss'
})
export class ComplaintDetailsComponent implements OnInit {
  readonly complaint = signal<(Complaint & { history: ComplaintHistoryEntry[] }) | null>(null);
  readonly nextStatus = signal<ComplaintStatus | ''>('');
  nextStatusModel: ComplaintStatus | '' = '';

  // Mirrors the backend TRANSITIONS map (services/complaint.service.js) so the
  // UI only ever offers status changes the API will actually accept.
  private readonly TRANSITIONS: Record<string, ComplaintStatus[]> = {
    open: ['assigned', 'cancelled'],
    assigned: ['accepted', 'rejected', 'cancelled'],
    accepted: ['reached_site', 'cancelled'],
    rejected: ['assigned', 'cancelled'],
    reached_site: ['started', 'cancelled'],
    started: ['in_progress', 'cancelled'],
    in_progress: ['waiting_for_parts', 'completed', 'cancelled'],
    waiting_for_parts: ['in_progress', 'cancelled'],
    completed: ['closed', 'in_progress'],
    closed: [],
    cancelled: []
  };

  private id!: number;

  constructor(private route: ActivatedRoute, private complaintService: ComplaintService) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.complaintService.get(this.id).subscribe((res) => this.complaint.set(res.data));
  }

  allowedNextStatuses(): ComplaintStatus[] {
    const status = this.complaint()?.status;
    return status ? this.TRANSITIONS[status] ?? [] : [];
  }

  updateStatus(): void {
    if (!this.nextStatus()) return;
    this.complaintService.updateStatus(this.id, this.nextStatus() as ComplaintStatus).subscribe(() => {
      this.nextStatus.set('');
      this.load();
    });
  }
}
