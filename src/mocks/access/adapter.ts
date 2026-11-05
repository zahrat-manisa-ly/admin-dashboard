import { type AxiosAdapter, AxiosHeaders, CanceledError, type InternalAxiosRequestConfig } from "axios";
import { z } from "zod";

import { initialRoles, initialUsers } from "@/app/(main)/dashboard/_components/access-data";
import { ApiError } from "@/lib/api/api-error";
import { endpoints } from "@/lib/api/endpoints";
import { type CurrentUser, roleInputSchema, type TeamRole, type TeamUser } from "@/lib/api/types/access";
import type { PermissionName } from "@/lib/auth/permissions";

// This module is imported lazily by Axios in the browser. Reloading resets the demo database.
const users: TeamUser[] = structuredClone(initialUsers);
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

  if (path === endpoints.authV1.me && method === "GET") return currentUser();
  if (path === endpoints.authV1.login && method === "POST") {
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
  if (path === endpoints.authV1.logout && method === "POST") {
    currentUserId = null;
    return null;
  }

  if (path === endpoints.rolesV1.list && method === "GET") {
    requirePermission("roles:read", "users:read");
    return roles.map((role) => ({
      ...role,
      memberCount: users.filter((user) => user.roleId === role.id).length,
    }));
  }
  if (path === endpoints.rolesV1.list && method === "POST") {
    requirePermission("roles:create");
    const input = parse(roleInputSchema, body);
    const role: TeamRole = { ...input, id: crypto.randomUUID(), memberCount: 0 };
    roles = [...roles, role];
    return role;
  }
  const roleId = path.startsWith(`${endpoints.rolesV1.list}/`)
    ? decodeURIComponent(path.slice(endpoints.rolesV1.list.length + 1))
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

export const accessMockAdapter: AxiosAdapter = async (config) => {
  await delay(config);
  return {
    data: structuredClone(handleRequest(config)),
    status: config.method?.toUpperCase() === "POST" && !config.url?.includes("/auth/") ? 201 : 200,
    statusText: "OK",
    headers: new AxiosHeaders({ "Content-Type": "application/json" }),
    config,
  };
};
