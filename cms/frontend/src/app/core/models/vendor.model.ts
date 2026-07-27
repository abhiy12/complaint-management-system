export interface Vendor {
  id: number;
  vendor_code: string;
  vendor_name: string;
  company_name?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  email: string;
  phone: string;
  contact_person?: string;
  status: 'active' | 'inactive';
  created_at: string;
}
