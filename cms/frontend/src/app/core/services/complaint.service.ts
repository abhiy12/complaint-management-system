import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Complaint, ComplaintHistoryEntry, ComplaintStatus, PaginatedResult } from '../models/complaint.model';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private readonly base = `${environment.apiUrl}/complaints`;

  constructor(private http: HttpClient) {}

  list(params: Record<string, string> = {}): Observable<ApiResponse<PaginatedResult<Complaint>>> {
    return this.http.get<ApiResponse<PaginatedResult<Complaint>>>(this.base, { params });
  }

  get(id: number): Observable<ApiResponse<Complaint & { history: ComplaintHistoryEntry[] }>> {
    return this.http.get<ApiResponse<Complaint & { history: ComplaintHistoryEntry[] }>>(`${this.base}/${id}`);
  }

  create(payload: Partial<Complaint>): Observable<ApiResponse<Complaint>> {
    return this.http.post<ApiResponse<Complaint>>(this.base, payload);
  }

  assign(complaintId: number, executiveId: number): Observable<ApiResponse<Complaint>> {
    return this.http.post<ApiResponse<Complaint>>(`${this.base}/assign`, { complaintId, executiveId });
  }

  updateStatus(complaintId: number, status: ComplaintStatus, remarks?: string): Observable<ApiResponse<Complaint>> {
    return this.http.post<ApiResponse<Complaint>>(`${this.base}/status`, { complaintId, status, remarks });
  }

  uploadImage(complaintId: number, file: File): Observable<ApiResponse<{ filePath: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ filePath: string }>>(`${this.base}/upload/${complaintId}`, formData);
  }
}
