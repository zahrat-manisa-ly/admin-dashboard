"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { type UsersParams, usersParamsSchema } from "@/lib/api/types/access";
import type { User } from "@/lib/api/types/users";

export type UsersUiStatus = "all" | "active" | "invited" | "suspended";

/** Dashboard team directory: staff accounts and the workspace owner. */
export function isTeamDirectoryUser(user: User): boolean {
  return user.account_type === "employee" || user.is_owner;
}

//--------filter----//
export function filterUsers(
  users: User[],
  {
    search,
    status,
    accountType,
  }: {
    search: string;
    status: UsersUiStatus;
    accountType: "all" | "employee" | "customer" | "owner";
  },
): User[] {
  const query = search.trim().toLowerCase();

  return users.filter((user) => {
    if (accountType === "employee" && !isTeamDirectoryUser(user)) return false;
    if (accountType === "owner" && !user.is_owner) return false;
    if (accountType === "customer" && user.account_type !== "customer") return false;

    if (status === "active" && user.is_blocked) return false;
    if (status === "suspended" && !user.is_blocked) return false;
    if (status === "invited") return false;

    if (!query) return true;

    const haystack = [user.first_name, user.last_name, user.email, user.phone_number, user.username]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function userDirectoryStats(users: User[], total: number) {
  return {
    total,
    active: users.filter((user) => !user.is_blocked).length,
    pending: 0,
    suspended: users.filter((user) => user.is_blocked).length,
  };
}

export function filterUsersByRoleId(users: User[], roleId: string): User[] {
  if (roleId === "all") return users;
  return users.filter((user) => user.roles?.some((role) => role.id === roleId));
}
//-------end-filter----//

//--------url----//
export function useUsersFilters() {
  const searchParams = useSearchParams();
  const params = usersParamsSchema.parse({
    search: (searchParams.get("search") ?? "").slice(0, 200),
    status: ["active", "invited", "suspended"].includes(searchParams.get("status") ?? "")
      ? searchParams.get("status")
      : "all",
    roleId: searchParams.get("role") ?? "all",
    sort: ["-name", "lastActive"].includes(searchParams.get("sort") ?? "") ? searchParams.get("sort") : "name",
    page: searchParams.get("page") ?? 1,
    pageSize: searchParams.get("size") ?? 10,
  });
  const [search, setSearch] = useState(params.search);

  function update(patch: Partial<UsersParams>) {
    const url = new URL(window.location.href);
    const keys = { search: "search", status: "status", roleId: "role", sort: "sort", page: "page", pageSize: "size" };
    for (const [key, value] of Object.entries(patch)) {
      const name = keys[key as keyof UsersParams];
      if (value === "" || value === "all") url.searchParams.delete(name);
      else url.searchParams.set(name, String(value));
    }
    // Native history integrates with App Router without a server navigation per keystroke.
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  useEffect(() => setSearch(params.search), [params.search]);
  useEffect(() => {
    if (search === params.search) return;
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      if (search.trim()) url.searchParams.set("search", search.trim());
      else url.searchParams.delete("search");
      url.searchParams.set("page", "1");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, params.search]);

  return { params, search, setSearch, update };
}
//-------end-url----//
