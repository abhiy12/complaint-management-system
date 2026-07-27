import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardCards {
  total_vendors: number;
  total_vendor_users: number;
  total_executives: number;
  available_executives: number;
  executives_on_leave: number;
  open_complaints: number;
  assigned_complaints: number;
  in_progress_complaints: number;
  completed_complaints: number;
  closed_complaints: number;
  todays_complaints: number;
  weekly_complaints: number;
  monthly_complaints: number;
}

export interface DashboardReport {
  cards: DashboardCards;
  statusCounts: { status: string; total: number }[];
  categoryWise: { category: string; total: number }[];
  priorityWise: { priority: string; total: number }[];
  monthlyTrend: { month: string; total: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly base = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  dashboard(): Observable<ApiResponse<DashboardReport>> {
    return this.http.get<ApiResponse<DashboardReport>>(`${this.base}/dashboard`);
  }

  exportUrl(type: 'vendor' | 'executive', format: 'excel' | 'csv'): string {
    return `${this.base}/export?type=${type}&format=${format}`;
  }
}
