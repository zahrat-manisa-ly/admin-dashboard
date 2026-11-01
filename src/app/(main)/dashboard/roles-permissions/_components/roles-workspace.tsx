"use client";

import { useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { usePermissions } from "@/app/(main)/dashboard/_components/access/access.queries";
import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { AccessSkeleton } from "@/app/(main)/dashboard/_components/access/access-skeleton";
import type { ResourcePermissions } from "@/components/shadcn-studio/blocks/roles-permission-application-01/roles-permission-application-01";
import RolesPermissionApplication01 from "@/components/shadcn-studio/blocks/roles-permission-application-01/roles-permission-application-01";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { authorizationApi } from "@/lib/api/services/authorization";
import { usersApi } from "@/lib/api/services/users";
import type { RoleWithPermissionsResponse } from "@/lib/api/types/authorization";
import { groupPermissions, type PermissionMatrix } from "@/lib/auth/permissions";
import { notify } from "@/lib/notify";
import { currentUserKey } from "@/lib/query/query-client";

const rolesKey = ["authorization", "roles"] as const;
const permissionsKey = ["authorization", "permissions"] as const;

function rowsFromMatrix(matrix: PermissionMatrix, assigned: Set<string>): ResourcePermissions[] {
  return matrix.resources.map((group) => ({
    resource: group.resource,
    label: group.resource.replaceAll("_", " "),
    toggles: group.permissions.map((permission) => ({
      permissionId: permission.id,
      action: permission.action,
      allowed: assigned.has(permission.id),
    })),
  }));
}

function allowedIds(rows: ResourcePermissions[]) {
  return rows.flatMap((row) => row.toggles.filter((toggle) => toggle.allowed).map((toggle) => toggle.permissionId));
}

export function RolesWorkspace() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const { can } = usePermissions();
  const client = useQueryClient();
  const rolesQuery = useQuery({
    queryKey: rolesKey,
    queryFn: ({ signal }) => authorizationApi.roles(signal),
    enabled: can("roles:read"),
  });
  const permissionsQuery = useQuery({
    queryKey: permissionsKey,
    queryFn: ({ signal }) => authorizationApi.permissions(signal),
    enabled: can("roles:read"),
  });
  const usersQuery = useQuery({
    queryKey: ["users-v1", "role-members"],
    queryFn: ({ signal }) => usersApi.list(1, 100, signal),
    enabled: can("users:read"),
  });

  const refreshRoles = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: rolesKey }),
      client.invalidateQueries({ queryKey: ["users-v1", "roles"] }),
      client.invalidateQueries({ queryKey: currentUserKey }),
    ]);
  };

  const matrix = useMemo(() => groupPermissions(permissionsQuery.data ?? []), [permissionsQuery.data]);
  const template = useMemo(() => rowsFromMatrix(matrix, new Set()), [matrix]);

  if (rolesQuery.isPending || permissionsQuery.isPending) return <AccessSkeleton kind="roles" />;
  if (!rolesQuery.data) {
    return (
      <AccessError error={rolesQuery.error} retry={() => void rolesQuery.refetch()} busy={rolesQuery.isFetching} />
    );
  }
  if (!permissionsQuery.data) {
    return (
      <AccessError
        error={permissionsQuery.error}
        retry={() => void permissionsQuery.refetch()}
        busy={permissionsQuery.isFetching}
      />
    );
  }

  const members = usersQuery.data?.items ?? [];
  const roles = rolesQuery.data.map((role) => toBlockRole(role, matrix, members));

  async function changePermission(roleId: string, permissionId: string, value: boolean) {
    if (!can("roles:manage_permissions")) {
      notify.error(ar ? "لا يمكن تعديل صلاحيات هذا الدور." : "Role permissions cannot be changed.");
      throw new Error("permission-unavailable");
    }
    try {
      if (value) await authorizationApi.addPermissions(roleId, [permissionId]);
      else await authorizationApi.removePermissions(roleId, [permissionId]);
      await refreshRoles();
    } catch (error) {
      notify.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function createRole(values: { name: string; permissions: ResourcePermissions[] }) {
    try {
      const role = await authorizationApi.createRole({ name: values.name.trim(), description: values.name.trim() });
      const ids = allowedIds(values.permissions);
      if (ids.length) await authorizationApi.addPermissions(role.id, ids);
      await refreshRoles();
      notify.success(ar ? "تم إنشاء الدور" : "Role created");
    } catch (error) {
      notify.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function updateRole(roleId: string, values: { name: string; permissions: ResourcePermissions[] }) {
    const current = rolesQuery.data?.find((role) => role.id === roleId);
    if (!current || !can("roles:manage_permissions")) {
      notify.error(ar ? "لا يمكن تعديل صلاحيات هذا الدور." : "Role permissions cannot be changed.");
      throw new Error("role-unavailable");
    }
    const nextIds = new Set(allowedIds(values.permissions));
    const currentIds = new Set(current.permissions.map((permission) => permission.id));
    const added = [...nextIds].filter((id) => !currentIds.has(id));
    const removed = [...currentIds].filter((id) => !nextIds.has(id));
    try {
      if (added.length) await authorizationApi.addPermissions(roleId, added);
      if (removed.length) await authorizationApi.removePermissions(roleId, removed);
      await refreshRoles();
      notify.success(ar ? "تم تحديث الصلاحيات" : "Permissions updated");
    } catch (error) {
      notify.error(getApiErrorMessage(error));
      throw error;
    }
  }

  async function deleteRole(roleId: string) {
    if (!can("roles:delete")) {
      notify.error(ar ? "لا يمكن حذف هذا الدور." : "This role cannot be deleted.");
      throw new Error("role-delete-unavailable");
    }
    try {
      await authorizationApi.deleteRole(roleId);
      await refreshRoles();
      notify.success(ar ? "تم حذف الدور" : "Role deleted");
    } catch (error) {
      notify.error(getApiErrorMessage(error));
      throw error;
    }
  }

  return (
    <>
      {rolesQuery.isError && (
        <AccessError error={rolesQuery.error} retry={() => void rolesQuery.refetch()} busy={rolesQuery.isFetching} />
      )}
      <RolesPermissionApplication01
        roles={roles}
        template={template}
        actions={matrix.actions}
        ar={ar}
        onPermissionChange={can("roles:manage_permissions") ? changePermission : undefined}
        onCreateRole={can("roles:create") ? createRole : undefined}
        onUpdateRole={can("roles:manage_permissions") ? updateRole : undefined}
        onDeleteRole={can("roles:delete") ? deleteRole : undefined}
      />
    </>
  );
}

function toBlockRole(
  role: RoleWithPermissionsResponse,
  matrix: PermissionMatrix,
  members: { id: string; first_name: string; last_name: string; roles?: { id: string }[] }[],
) {
  return {
    id: role.id,
    name: role.name,
    users: members
      .filter((member) => member.roles?.some((memberRole) => memberRole.id === role.id))
      .map((member) => ({ id: member.id, name: `${member.first_name} ${member.last_name}`.trim() })),
    permissions: rowsFromMatrix(matrix, new Set(role.permissions.map((permission) => permission.id))),
  };
}
