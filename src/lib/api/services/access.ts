import { apiClient, clearAccessToken, isMockApi, setAccessToken } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { authApi } from "@/lib/api/services/auth";
import { type CurrentUser, currentUserSchema, loginResponseSchema } from "@/lib/api/types/access";
import type { MyProfile } from "@/lib/api/types/auth";

//--------session-account----//
export type SessionAccount = {
  profile: MyProfile | null;
  user: CurrentUser;
};

function isMyProfile(account: MyProfile | CurrentUser): account is MyProfile {
  return "account_type" in account;
}

export function toCurrentUser(account: MyProfile | CurrentUser): CurrentUser {
  if (!isMyProfile(account)) return account;
  return currentUserSchema.parse({
    id: account.id,
    name: `${account.first_name} ${account.last_name}`.trim(),
    email: account.email ?? "",
    roleId: account.roles[0]?.id ?? "",
    status: account.is_blocked ? "suspended" : "active",
    lastActive: account.updated_at,
    roleName: account.roles[0]?.name ?? account.account_type,
    permissions: account.permissions,
  });
}

/** One GET /me. Python keeps the full profile; mock only has the reduced user. */
export async function loadSessionAccount(signal?: AbortSignal): Promise<SessionAccount> {
  if (!isMockApi) {
    const profile = await authApi.getMyProfile(signal);
    return { profile, user: toCurrentUser(profile) };
  }
  const user = currentUserSchema.parse((await apiClient.get<unknown>(endpoints.authV1.me, { signal })).data);
  return { profile: null, user };
}
//-------end-session-account----//

export const accessApi = {
  async login(input: { email: string; password: string }) {
    const session = loginResponseSchema.parse((await apiClient.post<unknown>(endpoints.authV1.login, input)).data);
    setAccessToken(session.access_token);
    return session.user;
  },
  async logout() {
    if (!isMockApi) return authApi.logout();
    try {
      await apiClient.post(endpoints.authV1.logout);
    } finally {
      clearAccessToken();
    }
  },
};
