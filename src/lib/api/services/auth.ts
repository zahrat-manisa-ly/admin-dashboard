import { apiClient, clearAccessToken, setAccessToken } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AcceptLoginTermsResult,
  ChangePasswordRequest,
  ConfirmRegistrationRequest,
  DeleteAccountRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResult,
  MyProfile,
  RegisteredUser,
  RegisterRequest,
  ResetPasswordRequest,
  TermsDocument,
  TrustedBrowser,
  TrustedBrowserRevocationResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from "@/lib/api/types/auth";

/** Real FastAPI auth. Use with NEXT_PUBLIC_API_MODE=python and NEXT_PUBLIC_API_URL set to the API origin. */
export const authApi = {
  async login(input: LoginRequest): Promise<LoginResult> {
    const { data } = await apiClient.post<LoginResult>(endpoints.authV1.login, input);
    if ("access_token" in data) setAccessToken(data.access_token);
    return data;
  },
  //--------login-terms----//
  async getCurrentTerms(signal?: AbortSignal): Promise<TermsDocument> {
    return (await apiClient.get<TermsDocument>(endpoints.terms.current, { signal })).data;
  },
  async acceptLoginTerms(transactionToken: string): Promise<AcceptLoginTermsResult> {
    const { data } = await apiClient.post<AcceptLoginTermsResult>(endpoints.authV1.acceptLoginTerms, {
      transaction_token: transactionToken,
    });
    if ("access_token" in data) setAccessToken(data.access_token);
    return data;
  },
  //-------end-login-terms----//
  async register(input: RegisterRequest): Promise<unknown> {
    // Swagger does not specify the success response schema for this endpoint.
    return (await apiClient.post<unknown>(endpoints.authV1.register, input)).data;
  },
  async confirmRegister(input: ConfirmRegistrationRequest): Promise<RegisteredUser> {
    return (await apiClient.post<RegisteredUser>(endpoints.authV1.confirmRegister, input)).data;
  },
  async forgotPassword(input: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const body: ForgotPasswordRequest = {
      email: input.email?.trim() || null,
      phone_number: input.phone_number?.trim() || null,
    };
    return (await apiClient.post<ForgotPasswordResponse>(endpoints.authV1.forgotPassword, body)).data;
  },
  async resetPassword(input: ResetPasswordRequest): Promise<void> {
    await apiClient.post(endpoints.authV1.resetPassword, {
      token: input.token,
      new_password: input.new_password,
      confirm_password: input.confirm_password,
      logout_other_sessions: input.logout_other_sessions ?? true,
    });
  },
  async getMyProfile(signal?: AbortSignal): Promise<MyProfile> {
    return (await apiClient.get<MyProfile>(endpoints.authV1.me, { signal })).data;
  },
  async updateMyProfile(input: UpdateMyProfileRequest): Promise<UpdateMyProfileResponse> {
    return (await apiClient.patch<UpdateMyProfileResponse>(endpoints.usersV1.me, input)).data;
  },
  async changePassword(input: ChangePasswordRequest): Promise<void> {
    await apiClient.post(endpoints.authV1.changePassword, input);
  },
  //--------trusted-browsers----//
  async listTrustedBrowsers(signal?: AbortSignal): Promise<TrustedBrowser[]> {
    return (await apiClient.get<TrustedBrowser[]>(endpoints.authV1.trustedBrowsers, { signal })).data;
  },
  async removeTrustedBrowser(id: string): Promise<TrustedBrowserRevocationResponse> {
    return (await apiClient.delete<TrustedBrowserRevocationResponse>(endpoints.authV1.trustedBrowser(id))).data;
  },
  async removeAllTrustedBrowsers(): Promise<TrustedBrowserRevocationResponse> {
    return (await apiClient.delete<TrustedBrowserRevocationResponse>(endpoints.authV1.trustedBrowsers)).data;
  },
  //-------end-trusted-browsers----//
  async deleteMyAccount(input: DeleteAccountRequest): Promise<void> {
    try {
      await apiClient.delete(endpoints.authV1.me, { data: input });
    } finally {
      clearAccessToken();
    }
  },
  async logout(): Promise<void> {
    try {
      await apiClient.post(endpoints.authV1.logout);
    } finally {
      clearAccessToken();
    }
  },
};
