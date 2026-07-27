export type UserRole = 'super_admin' | 'vendor_admin' | 'vendor_sub_user' | 'executive';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  vendorId?: number | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
