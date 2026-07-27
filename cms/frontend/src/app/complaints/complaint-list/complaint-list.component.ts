import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ComplaintService } from '../../core/services/complaint.service';
import { Complaint, ComplaintStatus } from '../../core/models/complaint.model';

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  open: '#e53935', assigned: '#3949ab', accepted: '#00897b', rejected: '#757575',
  started: '#fb8c00', reached_site: '#8e24aa', in_progress: '#fdd835',
  waiting_for_parts: '#f4511e', completed: '#43a047', closed: '#546e7a', cancelled: '#9e9e9e'
};

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatTableModule, MatPaginatorModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatChipsModule],
  templateUrl: './complaint-list.component.html',
  styleUrl: './complaint-list.component.scss'
})
export class ComplaintListComponent implements OnInit {
  // Plain properties backing the [(ngModel)] bindings in the template;
  // the signals below remain the source of truth used for the actual API calls.
  searchModel = '';
  statusModel = '';

  readonly complaints = signal<Complaint[]>([]);
  readonly total = signal(0);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly statusFilter = signal<string>('');
  readonly search = signal('');

  readonly displayedColumns = ['complaint_number', 'subject', 'vendor_name', 'priority', 'status', 'executive_name', 'created_at', 'actions'];
  readonly statuses: ComplaintStatus[] = ['open', 'assigned', 'accepted', 'rejected', 'started', 'reached_site',
    'in_progress', 'waiting_for_parts', 'completed', 'closed', 'cancelled'];

  constructor(private complaintService: ComplaintService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const params: Record<string, string> = {
      page: String(this.pageIndex() + 1),
      limit: String(this.pageSize())
    };
    if (this.statusFilter()) params['status'] = this.statusFilter();
    if (this.search()) params['search'] = this.search();

    this.complaintService.list(params).subscribe((res) => {
      this.complaints.set(res.data.rows);
      this.total.set(res.data.total);
    });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  onFilterChange(): void { this.pageIndex.set(0); this.load(); }

  statusColor(status: ComplaintStatus): string { return STATUS_COLORS[status]; }
}
