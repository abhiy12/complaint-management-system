export interface Executive {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  zone?: string;
  department?: string;
  skills?: string;
  vehicle_number?: string;
  experience_years?: number;
  current_status: 'available' | 'busy' | 'offline';
  current_latitude?: number;
  current_longitude?: number;
  is_online: boolean;
  is_on_leave: boolean;
}
