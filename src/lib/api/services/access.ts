import { apiClient, clearAccessToken, isMockApi, setAccessToken } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { authApi } from "@/lib/api/services/auth";
import { currentUserSchema, loginResponseSchema, type RoleInput, roleSchema } from "@/lib/api/types/access";

export const accessApi = {
  async currentUser(signal?: AbortSignal) {
    if (!isMockApi) {
      const profile = await authApi.getMyProfile(signal);
      return currentUserSchema.parse({
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`.trim(),
        email: profile.email ?? "",
        roleId: profile.roles[0]?.id ?? "",
        status: profile.is_blocked ? "suspended" : "active",
        lastActive: profile.updated_at,
        roleName: profile.roles[0]?.name ?? profile.account_type,
        permissions: profile.permissions,
      });
    }
    return currentUserSchema.parse((await apiClient.get<unknown>(endpoints.authV1.me, { signal })).data);
  },
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
  async roles(signal?: AbortSignal) {
    return roleSchema.array().parse((await apiClient.get<unknown>(endpoints.rolesV1.list, { signal })).data);
  },
  async createRole(input: RoleInput) {
    return roleSchema.parse((await apiClient.post<unknown>(endpoints.rolesV1.list, input)).data);
  },
  async updateRole(id: string, input: RoleInput) {
    return roleSchema.parse((await apiClient.patch<unknown>(endpoints.rolesV1.detail(id), input)).data);
  },
  async deleteRole(id: string) {
    await apiClient.delete(endpoints.rolesV1.detail(id));
  },
};
