"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/api-error";
import { accessApi } from "@/lib/api/services/access";
import type { UsersParams } from "@/lib/api/types/access";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { currentUserKey } from "@/lib/query/query-client";

export const accessKeys = {
  scope: (ownerId: string) => ["access", ownerId] as const,
  users: (ownerId: string) => ["access", ownerId, "users"] as const,
  list: (ownerId: string, params: UsersParams) => ["access", ownerId, "users", "list", params] as const,
  user: (ownerId: string, id: string) => ["access", ownerId, "users", "detail", id] as const,
  stats: (ownerId: string) => ["access", ownerId, "users", "stats"] as const,
  roles: (ownerId: string) => ["access", ownerId, "roles"] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: async ({ signal }) => {
      try {
        return await accessApi.currentUser(signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    enabled: typeof window !== "undefined",
    staleTime: 15000,
  });
}

export function usePermissions() {
  const query = useCurrentUserQuery();
  // Never render stale access controls after a failed permissions refresh.
  const currentUser = query.isError ? null : query.data;

  const can = (permission: Permission) => hasPermission(currentUser?.permissions ?? [], permission);

  return { ...query, currentUser, can, ownerId: currentUser?.id ?? "anonymous" };
}

export const usersQueryOptions = (ownerId: string, params: UsersParams) =>
  queryOptions({
    queryKey: accessKeys.list(ownerId, params),
    queryFn: ({ signal }) => accessApi.users(params, signal),
  });

export const userQueryOptions = (ownerId: string, id: string) =>
  queryOptions({
    queryKey: accessKeys.user(ownerId, id),
    queryFn: ({ signal }) => accessApi.user(id, signal),
  });

export const rolesQueryOptions = (ownerId: string) =>
  queryOptions({
    queryKey: accessKeys.roles(ownerId),
    queryFn: ({ signal }) => accessApi.roles(signal),
  });

export function useRolesQuery() {
  const { ownerId, can } = usePermissions();
  return useQuery({ ...rolesQueryOptions(ownerId), enabled: can("roles:read") || can("users:read") });
}
