import type { RegisteredUser } from "@/lib/api/types/auth";

export type User = RegisteredUser;

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** GET /api/v1/users/c */
export interface CustomerListKpis {
  total_customers?: number;
  active_customers?: number;
  blocked_customers?: number;
  new_this_month?: number;
}

export interface CustomerListResponse extends Page<User> {
  kpis: CustomerListKpis;
}

export interface ListCustomersParams {
  search?: string;
  page: number;
  size: number;
}

/** PATCH /api/v1/users/c/me */
export interface CustomerProfileUpdate {
  image?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
}

/** GET /api/v1/users/invitations */
export interface ListInvitationsParams {
  includeHistory?: boolean;
  page: number;
  size: number;
}

/** POST /api/v1/users/invitations/{invitation_id}/resend */
export interface InvitationResendRequest {
  role_ids?: string[] | null;
}

// POST /api/v1/users sends an invitation, not a fully created user.
export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role_ids: string[];
  date_of_birth?: string | null;
  phone_number?: string | null;
  occupation?: string | null;
  image?: string | null;
  employee_id?: string | null;
  username?: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_ids: string[];
  invited_by: string | null;
  created_at: string;
  expires_at: string;
  sent_at: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  accepted_user_id: string | null;
}

// PATCH /api/v1/users/{user_id}/employee; email/roles are not part of this endpoint.
export interface UpdateEmployeeRequest {
  username?: string | null;
  image?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  occupation?: string | null;
  employee_id?: string | null;
}
