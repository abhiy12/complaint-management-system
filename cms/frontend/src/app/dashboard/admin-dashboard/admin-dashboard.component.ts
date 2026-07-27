import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportService, DashboardReport } from '../../core/services/report.service';

interface CardDef { label: string; key: keyof DashboardReport['cards']; icon: string; color: string; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  readonly report = signal<DashboardReport | null>(null);

  readonly cardDefs: CardDef[] = [
    { label: 'Total Vendors', key: 'total_vendors', icon: 'store', color: '#3f51b5' },
    { label: 'Total Executives', key: 'total_executives', icon: 'engineering', color: '#00897b' },
    { label: 'Available Executives', key: 'available_executives', icon: 'check_circle', color: '#43a047' },
    { label: 'On Leave', key: 'executives_on_leave', icon: 'event_busy', color: '#fb8c00' },
    { label: 'Open Complaints', key: 'open_complaints', icon: 'report_problem', color: '#e53935' },
    { label: 'In Progress', key: 'in_progress_complaints', icon: 'hourglass_top', color: '#fdd835' },
    { label: 'Completed', key: 'completed_complaints', icon: 'task_alt', color: '#8e24aa' },
    { label: "Today's Complaints", key: 'todays_complaints', icon: 'today', color: '#3949ab' }
  ];

  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  trendChartData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: 'Complaints', tension: 0.35 }] };
  priorityChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Priority' }] };

  chartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.dashboard().subscribe((res) => {
      const data = res.data;
      this.report.set(data);

      this.statusChartData = {
        labels: data.statusCounts.map((s) => s.status),
        datasets: [{ data: data.statusCounts.map((s) => s.total) }]
      };
      this.trendChartData = {
        labels: data.monthlyTrend.map((m) => m.month),
        datasets: [{ data: data.monthlyTrend.map((m) => m.total), label: 'Complaints', tension: 0.35 }]
      };
      this.priorityChartData = {
        labels: data.priorityWise.map((p) => p.priority),
        datasets: [{ data: data.priorityWise.map((p) => p.total), label: 'Priority' }]
      };
    });
  }

  cardValue(key: keyof DashboardReport['cards']): number {
    return this.report()?.cards?.[key] ?? 0;
  }
}
