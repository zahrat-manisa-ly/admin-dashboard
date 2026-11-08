"use client";

// React Imports
import { useEffect, useState } from "react";

import PermissionsTable from "@/components/shadcn-studio/blocks/roles-permission-application-01/content/permissions-table";
import RolesGrid from "@/components/shadcn-studio/blocks/roles-permission-application-01/content/roles-grid";
// Component Imports
import { Card, CardContent } from "@/components/ui/card";

export type PermissionToggle = {
  permissionId: string;
  action: string;
  allowed: boolean;
};

export type ResourcePermissions = {
  resource: string;
  label: string;
  toggles: PermissionToggle[];
};

export type AppRole = {
  id: string;
  name: string;
  permissions: ResourcePermissions[];
};

type RolesPermissionApplication01Props = {
  roles: AppRole[];
  template: ResourcePermissions[];
  actions: string[];
  ar?: boolean;
  onPermissionChange?: (roleId: string, permissionId: string, value: boolean) => Promise<void> | void;
  onCreateRole?: (values: { name: string; permissions: ResourcePermissions[] }) => Promise<void>;
  onUpdateRole?: (roleId: string, values: { name: string; permissions: ResourcePermissions[] }) => Promise<void>;
  onDeleteRole?: (roleId: string) => Promise<void>;
};

const RolesPermissionApplication01 = ({
  roles: initialRoles,
  template,
  actions,
  ar = false,
  onPermissionChange,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}: RolesPermissionApplication01Props) => {
  const [roles, setRoles] = useState(initialRoles);

  useEffect(() => {
    setRoles(initialRoles);
  }, [initialRoles]);

  const handlePermissionChange = async (roleId: string, permissionId: string, value: boolean) => {
    const previous = roles;

    setRoles((prev) =>
      prev.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.map((row) => ({
                ...row,
                toggles: row.toggles.map((toggle) =>
                  toggle.permissionId === permissionId ? { ...toggle, allowed: value } : toggle,
                ),
              })),
            }
          : role,
      ),
    );

    try {
      await onPermissionChange?.(roleId, permissionId, value);
    } catch {
      setRoles(previous);
    }
  };

  return (
    <section>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-semibold text-2xl">{ar ? "الأدوار والصلاحيات" : "Roles & Permissions"}</h1>
            <p className="text-muted-foreground text-sm">
              {ar
                ? "تحكّم فيما يمكن لكل دور رؤيته وتنفيذه عبر الحجوزات والباقات والمالية والدعم."
                : "Control what each team role can see and do across bookings, packages, finances and support."}
            </p>
          </div>

          <RolesGrid
            roles={roles}
            template={template}
            ar={ar}
            onCreateRole={onCreateRole}
            onUpdateRole={onUpdateRole}
            onDeleteRole={onDeleteRole}
          />

          <Card className="min-w-0 shrink-0 gap-0 p-0">
            <CardContent className="max-h-[60vh] overflow-y-auto p-0">
              <PermissionsTable
                roles={roles}
                rows={template}
                actions={actions}
                ar={ar}
                onPermissionChange={handlePermissionChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RolesPermissionApplication01;
