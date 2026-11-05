// Contracts from https://api-production-d8b2.up.railway.app/openapi.json.
// Optional nullable fields follow FastAPI's request/response definitions.
export interface LoginRequest {
  email?: string | null;
  phone_number?: string | null;
  password: string;
  remember_me?: boolean;
  device_name?: string | null;
}

export interface RegisterRequest {
  email?: string | null;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  date_of_birth?: string | null;
  image?: string | null;
  username?: string | null;
  phone_number?: string | null;
  terms_and_conditions: boolean;
}

export interface ConfirmRegistrationRequest {
  email?: string | null;
  phone_number?: string | null;
  otp: string;
}

/** POST /api/v1/auth/forgot-password. Either identifier may be sent; the other is null. */
export interface ForgotPasswordRequest {
  email?: string | null;
  phone_number?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface LoginTermsRequiredResponse {
  requires_terms_acceptance?: true;
  transaction_token: string;
}

export interface TermsSection {
  title: string;
  items: string[];
}

/** GET /api/v1/terms/current */
export interface TermsDocument {
  id: string;
  version: string;
  content: TermsSection[];
  published_at: string;
  is_current: boolean;
}

/** POST /api/v1/auth/login/accept-terms */
export interface AcceptLoginTermsRequest {
  transaction_token: string;
}

export interface MfaPublicMethod {
  id: string;
  type: string;
  label: string;
}

export interface MfaChallengeResponse {
  status?: "verification_required";
  challenge_token: string;
  expires_in: number;
  methods: MfaPublicMethod[];
  preferred_method: string | null;
  recovery_available: boolean;
}

export type AcceptLoginTermsResult = TokenResponse | MfaChallengeResponse;

// Login can require accepting terms or MFA instead of returning an access token.
export type LoginResult = TokenResponse | LoginTermsRequiredResponse | MfaChallengeResponse;

export type AccountType = "employee" | "customer" | "owner";

export interface RegisteredUser {
  id: string;
  username?: string | null;
  occupation?: string | null;
  employee_id?: string | null;
  email?: string | null;
  phone_number?: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  date_of_birth?: string | null;
  image?: string | null;
  account_type: AccountType;
  is_owner: boolean;
  is_blocked: boolean;
  /** Present on some user payloads (e.g. detail); list may omit it. */
  roles?: MyRole[];
}

export interface MyRole {
  id: string;
  name: string;
}

/** GET /api/v1/auth/me — CurrentUserResponse */
export interface MyProfile extends RegisteredUser {
  roles: MyRole[];
  permissions: string[];
}

/** PATCH /api/v1/users/me — EmployeeUpdate */
export interface UpdateMyProfileRequest {
  username?: string | null;
  image?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  occupation?: string | null;
  employee_id?: string | null;
}

/** PATCH /api/v1/users/me response — UserResponse */
export type UpdateMyProfileResponse = RegisteredUser;

/** POST /api/v1/auth/reset-password. Token comes from the email link. */
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
  logout_other_sessions?: boolean;
}

/** POST /api/v1/auth/change-password */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/** DELETE /api/v1/auth/me */
export interface DeleteAccountRequest {
  password: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/** GET /api/v1/auth/trusted-browsers */
export interface TrustedBrowser {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  current: boolean;
}

/** DELETE /api/v1/auth/trusted-browsers and DELETE /api/v1/auth/trusted-browsers/{browser_id} */
export interface TrustedBrowserRevocationResponse {
  message: string;
}
