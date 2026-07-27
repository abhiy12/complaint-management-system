import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Executive } from '../models/executive.model';
import { PaginatedResult } from '../models/complaint.model';

@Injectable({ providedIn: 'root' })
export class ExecutiveService {
  private readonly base = `${environment.apiUrl}/executives`;

  constructor(private http: HttpClient) {}

  list(params: Record<string, string> = {}): Observable<ApiResponse<PaginatedResult<Executive>>> {
    return this.http.get<ApiResponse<PaginatedResult<Executive>>>(this.base, { params });
  }

  get(id: number): Observable<ApiResponse<Executive>> {
    return this.http.get<ApiResponse<Executive>>(`${this.base}/${id}`);
  }

  create(payload: Partial<Executive>): Observable<ApiResponse<{ executiveId: number }>> {
    return this.http.post<ApiResponse<{ executiveId: number }>>(this.base, payload);
  }

  updateLocation(latitude: number, longitude: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.base}/location`, { latitude, longitude });
  }

  applyLeave(payload: { leaveFrom: string; leaveTo: string; leaveType: string; reason?: string }): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.base}/leave`, payload);
  }
}
