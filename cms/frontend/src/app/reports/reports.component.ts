import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ReportService } from '../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <h1>Reports</h1>
    <mat-card class="card">
      <h3>Vendor-wise Report</h3>
      <a mat-stroked-button [href]="reportService.exportUrl('vendor','excel')" target="_blank">Export Excel</a>
      <a mat-stroked-button [href]="reportService.exportUrl('vendor','csv')" target="_blank">Export CSV</a>
    </mat-card>
    <mat-card class="card">
      <h3>Executive Performance Report</h3>
      <a mat-stroked-button [href]="reportService.exportUrl('executive','excel')" target="_blank">Export Excel</a>
      <a mat-stroked-button [href]="reportService.exportUrl('executive','csv')" target="_blank">Export CSV</a>
    </mat-card>
    <p class="hint">PDF export and custom date-range reports follow the same /api/reports/export pattern — extend
      report.controller.js's exportReport() with a 'pdf' branch (PDFKit is already a backend dependency) and a
      date-range query on the report repositories.</p>
  `,
  styles: [`.card{padding:20px;margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .hint{color:#6b7280;font-size:13px;max-width:700px}`]
})
export class ReportsComponent {
  constructor(public reportService: ReportService) {}
}
