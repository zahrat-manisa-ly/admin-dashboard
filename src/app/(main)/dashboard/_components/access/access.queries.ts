"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/api-error";
import { isMockApi } from "@/lib/api/client";
import { loadSessionAccount, type SessionAccount } from "@/lib/api/services/access";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { catalogStaleTime } from "@/lib/query/catalog";
import { currentUserKey } from "@/lib/query/query-client";

//--------session-account----//
function selectCurrentUser(account: SessionAccount | null) {
  return account?.user ?? null;
}

function selectMyProfile(account: SessionAccount | null) {
  return account?.profile ?? null;
}

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: currentUserKey,
    queryFn: async ({ signal }) => {
      try {
        return await loadSessionAccount(signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    enabled: typeof window !== "undefined",
    staleTime: catalogStaleTime,
  });
}

export function useCurrentUserQuery() {
  return useQuery({ ...sessionQueryOptions(), select: selectCurrentUser });
}

export function useMyProfileQuery() {
  return useQuery({
    ...sessionQueryOptions(),
    enabled: !isMockApi && typeof window !== "undefined",
    select: selectMyProfile,
  });
}
//-------end-session-account----//

export function usePermissions() {
  const query = useCurrentUserQuery();
  // Never render stale access controls after a failed permissions refresh.
  const currentUser = query.isError ? null : query.data;

  const can = (permission: Permission) => hasPermission(currentUser?.permissions ?? [], permission);

  return { ...query, currentUser, can };
}
