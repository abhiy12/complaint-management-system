import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { ExecutiveService } from '../../core/services/executive.service';
import { Executive } from '../../core/models/executive.model';

@Component({
  selector: 'app-executive-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatChipsModule],
  templateUrl: './executive-list.component.html',
  styleUrl: './executive-list.component.scss'
})
export class ExecutiveListComponent implements OnInit {
  readonly executives = signal<Executive[]>([]);
  readonly displayedColumns = ['employee_id', 'name', 'zone', 'phone', 'current_status', 'is_on_leave', 'actions'];

  constructor(private executiveService: ExecutiveService) {}

  ngOnInit(): void {
    this.executiveService.list().subscribe((res) => this.executives.set(res.data.rows));
  }
}
