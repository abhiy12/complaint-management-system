import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintHistoryEntry } from '../../core/models/complaint.model';

@Component({
  selector: 'app-complaint-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complaint-timeline.component.html',
  styleUrl: './complaint-timeline.component.scss'
})
export class ComplaintTimelineComponent {
  @Input() history: ComplaintHistoryEntry[] = [];
}
