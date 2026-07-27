export type ComplaintStatus =
  | 'open' | 'assigned' | 'accepted' | 'rejected' | 'started' | 'reached_site'
  | 'in_progress' | 'waiting_for_parts' | 'completed' | 'closed' | 'cancelled';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

export interface Complaint {
  id: number;
  complaint_number: string;
  vendor_id: number;
  vendor_name?: string;
  category: string;
  complaint_type?: string;
  priority: ComplaintPriority;
  subject: string;
  description?: string;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  assigned_executive_id?: number | null;
  executive_name?: string;
  status: ComplaintStatus;
  remarks?: string;
  expected_completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintHistoryEntry {
  id: number;
  complaint_id: number;
  actor_name: string;
  from_status: string | null;
  to_status: string;
  remarks: string | null;
  created_at: string;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
}
