import { z } from "zod";

import { apiClient, clearAccessToken, isMockApi, setAccessToken } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { authApi } from "@/lib/api/services/auth";
import {
  currentUserSchema,
  loginResponseSchema,
  type RoleInput,
  roleSchema,
  type UserInput,
  type UsersParams,
  type UserUpdate,
  userSchema,
  userStatsSchema,
  usersPageSchema,
} from "@/lib/api/types/access";

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
    return currentUserSchema.parse((await apiClient.get<unknown>(endpoints.auth.me, { signal })).data);
  },
  async login(input: { email: string; password: string }) {
    const session = loginResponseSchema.parse((await apiClient.post<unknown>(endpoints.auth.login, input)).data);
    setAccessToken(session.access_token);
    return session.user;
  },
  async logout() {
    if (!isMockApi) return authApi.logout();
    try {
      await apiClient.post(endpoints.auth.logout);
    } finally {
      clearAccessToken();
    }
  },
  async demoAccounts(signal?: AbortSignal) {
    return z.array(userSchema).parse((await apiClient.get<unknown>(endpoints.auth.demoAccounts, { signal })).data);
  },
  async switchDemoAccount(userId: string) {
    return currentUserSchema.parse((await apiClient.post<unknown>(endpoints.auth.demoSession, { userId })).data);
  },
  async users(params: UsersParams, signal?: AbortSignal) {
    return usersPageSchema.parse((await apiClient.get<unknown>(endpoints.users.list, { params, signal })).data);
  },
  async user(id: string, signal?: AbortSignal) {
    return userSchema.parse((await apiClient.get<unknown>(endpoints.users.detail(id), { signal })).data);
  },
  async stats(signal?: AbortSignal) {
    return userStatsSchema.parse((await apiClient.get<unknown>(endpoints.users.stats, { signal })).data);
  },
  async createUser(input: UserInput) {
    return userSchema.parse((await apiClient.post<unknown>(endpoints.users.list, input)).data);
  },
  async updateUser(id: string, input: UserUpdate) {
    return userSchema.parse((await apiClient.patch<unknown>(endpoints.users.detail(id), input)).data);
  },
  async deleteUser(id: string) {
    await apiClient.delete(endpoints.users.detail(id));
  },
  async roles(signal?: AbortSignal) {
    return z.array(roleSchema).parse((await apiClient.get<unknown>(endpoints.roles.list, { signal })).data);
  },
  async createRole(input: RoleInput) {
    return roleSchema.parse((await apiClient.post<unknown>(endpoints.roles.list, input)).data);
  },
  async updateRole(id: string, input: RoleInput) {
    return roleSchema.parse((await apiClient.patch<unknown>(endpoints.roles.detail(id), input)).data);
  },
  async deleteRole(id: string) {
    await apiClient.delete(endpoints.roles.detail(id));
  },
};
