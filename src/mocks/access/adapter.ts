import { type AxiosAdapter, AxiosHeaders, CanceledError, type InternalAxiosRequestConfig } from "axios";
import { z } from "zod";

import { initialRoles, initialUsers } from "@/app/(main)/dashboard/_components/access-data";
import { ApiError } from "@/lib/api/api-error";
import { endpoints } from "@/lib/api/endpoints";
import {
  type CurrentUser,
  roleInputSchema,
  type TeamRole,
  type TeamUser,
  userInputSchema,
  usersParamsSchema,
  userUpdateSchema,
} from "@/lib/api/types/access";
import type { PermissionName } from "@/lib/auth/permissions";

// This module is imported lazily by Axios in the browser. Reloading resets the demo database.
let users: TeamUser[] = structuredClone(initialUsers);
let roles: TeamRole[] = initialRoles.map(
  (role): TeamRole => ({
    ...role,
    memberCount: 0,
    permissions:
      role.id === "manager"
        ? role.permissions.filter((permission) => !permission.endsWith(".delete"))
        : role.permissions,
  }),
);
let currentUserId: string | null = "u1";

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join(".") || "form";
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
  }
  throw new ApiError("Check the submitted fields.", 422, fieldErrors);
}

function currentUser(): CurrentUser {
  const user = users.find((entry) => entry.id === currentUserId && entry.status === "active");
  const role = roles.find((entry) => entry.id === user?.roleId);
  if (!user || !role) throw new ApiError("Your session has ended. Please sign in.", 401);
  return { ...user, roleName: role.name, permissions: [...role.permissions] };
}

function requirePermission(...permissions: PermissionName[]) {
  const user = currentUser();
  if (!permissions.some((permission) => user.permissions.includes(permission))) {
    throw new ApiError("You do not have permission to perform this action.", 403);
  }
}

function delay(config: InternalAxiosRequestConfig) {
  return new Promise<void>((resolve, reject) => {
    if (config.signal?.aborted) return reject(new CanceledError());
    const abort = () => {
      clearTimeout(timer);
      config.signal?.removeEventListener?.("abort", abort);
      reject(new CanceledError());
    };
    const timer = setTimeout(() => {
      config.signal?.removeEventListener?.("abort", abort);
      resolve();
    }, 350);
    config.signal?.addEventListener?.("abort", abort, { once: true });
  });
}

function handleRequest(config: InternalAxiosRequestConfig): unknown {
  const path = config.url ?? "";
  const method = config.method?.toUpperCase() ?? "GET";
  const body: unknown = typeof config.data === "string" ? JSON.parse(config.data) : config.data;

  if (path === endpoints.auth.me && method === "GET") return currentUser();
  if (path === endpoints.auth.login && method === "POST") {
    const input = parse(z.object({ email: z.email(), password: z.string() }), body);
    const email = input.email.toLowerCase();
    const user = users.find((entry) =>
      email === "admin@manisatravel.com" ? entry.id === "u1" : entry.email.toLowerCase() === email,
    );
    if (!user || input.password !== "demo123456" || user.status !== "active") {
      throw new ApiError("Invalid email or password.", 401);
    }
    currentUserId = user.id;
    return { access_token: "mock-access-token", token_type: "bearer", user: currentUser() };
  }
  if (path === endpoints.auth.logout && method === "POST") {
    currentUserId = null;
    return null;
  }
  if (path === endpoints.auth.demoAccounts && method === "GET") {
    currentUser();
    return users.filter((user) => user.status === "active");
  }
  if (path === endpoints.auth.demoSession && method === "POST") {
    const input = parse(z.object({ userId: z.string() }), body);
    if (!users.some((user) => user.id === input.userId && user.status === "active")) {
      throw new ApiError("This demo account is not active.", 422);
    }
    currentUserId = input.userId;
    return currentUser();
  }

  if (path === endpoints.users.stats && method === "GET") {
    requirePermission("users:read");
    return {
      total: users.length,
      active: users.filter((user) => user.status === "active").length,
      invited: users.filter((user) => user.status === "invited").length,
    };
  }
  if (path === endpoints.users.list && method === "GET") {
    requirePermission("users:read");
    const params = parse(usersParamsSchema, config.params ?? {});
    const search = params.search.trim().toLowerCase();
    const filtered = users.filter(
      (user) =>
        (params.status === "all" || user.status === params.status) &&
        (params.roleId === "all" || user.roleId === params.roleId) &&
        `${user.name} ${user.email}`.toLowerCase().includes(search),
    );
    filtered.sort((a, b) =>
      params.sort === "lastActive"
        ? b.lastActive.localeCompare(a.lastActive) || a.id.localeCompare(b.id)
        : (params.sort === "-name" ? -1 : 1) * a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
    );
    return {
      items: filtered.slice((params.page - 1) * params.pageSize, params.page * params.pageSize),
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  }
  if (path === endpoints.users.list && method === "POST") {
    requirePermission("users:create");
    const input = parse(userInputSchema, body);
    validateUser(input.email, input.roleId);
    const user: TeamUser = { ...input, id: crypto.randomUUID(), status: "invited", lastActive: "" };
    users = [...users, user];
    return user;
  }
  const userId = path.startsWith(`${endpoints.users.list}/`)
    ? decodeURIComponent(path.slice(endpoints.users.list.length + 1))
    : undefined;
  if (userId && !userId.includes("/")) {
    const user = users.find((entry) => entry.id === userId);
    if (method === "GET") {
      requirePermission("users:read");
      if (!user) throw new ApiError("User not found.", 404);
      return user;
    }
    if (method === "PATCH") {
      requirePermission("employee:update");
      if (!user) throw new ApiError("User not found.", 404);
      const input = parse(userUpdateSchema, body);
      const updated = { ...user, ...input };
      const protectedRole = roles.find((role) => role.id === user.roleId)?.locked;
      if (
        (protectedRole || user.id === currentUserId) &&
        (updated.roleId !== user.roleId || updated.status !== user.status)
      ) {
        throw new ApiError("The current account and system administrator access cannot be changed here.", 409);
      }
      validateUser(updated.email, updated.roleId, user.id);
      users = users.map((entry) => (entry.id === user.id ? updated : entry));
      return updated;
    }
    if (method === "DELETE") {
      requirePermission("users:delete");
      if (!user) throw new ApiError("User not found.", 404);
      if (user.id === currentUserId || roles.find((role) => role.id === user.roleId)?.locked) {
        throw new ApiError("This account cannot be deleted.", 409);
      }
      users = users.filter((entry) => entry.id !== user.id);
      return null;
    }
  }
  if (path === endpoints.roles.list && method === "GET") {
    requirePermission("roles:read", "users:read");
    return roles.map((role) => ({
      ...role,
      memberCount: users.filter((user) => user.roleId === role.id).length,
    }));
  }
  if (path === endpoints.roles.list && method === "POST") {
    requirePermission("roles:create");
    const input = parse(roleInputSchema, body);
    const role: TeamRole = { ...input, id: crypto.randomUUID(), memberCount: 0 };
    roles = [...roles, role];
    return role;
  }
  const roleId = path.startsWith(`${endpoints.roles.list}/`)
    ? decodeURIComponent(path.slice(endpoints.roles.list.length + 1))
    : undefined;
  if (roleId && !roleId.includes("/") && (method === "PATCH" || method === "DELETE")) {
    requirePermission(method === "PATCH" ? "roles:manage_permissions" : "roles:delete");
    const role = roles.find((entry) => entry.id === roleId);
    if (!role) throw new ApiError("Role not found.", 404);
    if (role.locked) throw new ApiError("The administrator role is locked.", 409);
    if (method === "PATCH") {
      const input = parse(roleInputSchema, body);
      const updated = { ...role, ...input };
      roles = roles.map((entry) => (entry.id === role.id ? updated : entry));
      return { ...updated, memberCount: users.filter((user) => user.roleId === role.id).length };
    }
    if (users.some((user) => user.roleId === role.id)) {
      throw new ApiError("Assign members to another role before deleting this role.", 409);
    }
    roles = roles.filter((entry) => entry.id !== role.id);
    return null;
  }
  throw new ApiError("The mock endpoint does not exist.", 404);
}

function validateUser(email: string, roleId: string, id?: string) {
  if (users.some((user) => user.id !== id && user.email.toLowerCase() === email.toLowerCase())) {
    throw new ApiError("This email is already in use.", 422, { email: ["This email is already in use."] });
  }
  if (!roles.some((role) => role.id === roleId)) {
    throw new ApiError("Select an existing role.", 422, { roleId: ["Select an existing role."] });
  }
}

export const accessMockAdapter: AxiosAdapter = async (config) => {
  await delay(config);
  return {
    data: structuredClone(handleRequest(config)),
    status: config.method?.toUpperCase() === "POST" && !config.url?.startsWith("/auth/") ? 201 : 200,
    statusText: "OK",
    headers: new AxiosHeaders({ "Content-Type": "application/json" }),
    config,
  };
};
