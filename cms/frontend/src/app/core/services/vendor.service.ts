import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Vendor } from '../models/vendor.model';
import { PaginatedResult } from '../models/complaint.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly base = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient) {}

  list(params: Record<string, string> = {}): Observable<ApiResponse<PaginatedResult<Vendor>>> {
    return this.http.get<ApiResponse<PaginatedResult<Vendor>>>(this.base, { params });
  }

  get(id: number): Observable<ApiResponse<Vendor>> {
    return this.http.get<ApiResponse<Vendor>>(`${this.base}/${id}`);
  }

  create(payload: Partial<Vendor> & { defaultUserEmail?: string; defaultUserPassword?: string }):
    Observable<ApiResponse<{ vendor: Vendor; defaultUser: { email: string; tempPassword: string | null } }>> {
    return this.http.post<ApiResponse<{ vendor: Vendor; defaultUser: { email: string; tempPassword: string | null } }>>(this.base, payload);
  }

  update(id: number, payload: Partial<Vendor>): Observable<ApiResponse<Vendor>> {
    return this.http.put<ApiResponse<Vendor>>(`${this.base}/${id}`, payload);
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }
}
