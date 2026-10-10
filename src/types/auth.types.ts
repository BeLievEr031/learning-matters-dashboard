export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'class_teacher'
  | 'teacher'
  | 'student';

export type UserStatus = 'active' | 'inactive';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  status?: UserStatus;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
