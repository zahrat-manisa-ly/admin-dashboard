"use client";

import type { ComponentType } from "react";

import type {
  AppRoleWithUsers,
  ResourcePermissions,
} from "@/components/shadcn-studio/blocks/roles-permission-application-01/roles-permission-application-01";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

type PermissionsTableProps = {
  roles: AppRoleWithUsers[];
  rows: ResourcePermissions[];
  actions: string[];
  ar?: boolean;
  onPermissionChange: (roleId: string, permissionId: string, value: boolean) => void;
};

const actionLabels: Record<string, { en: string; ar: string }> = {
  read: { en: "Read", ar: "عرض" },
  create: { en: "Create", ar: "إنشاء" },
  update: { en: "Update", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
};

const actionIcons: Record<string, string> = {
  read: "EyeIcon",
  create: "PlusIcon",
  update: "PencilLineIcon",
  delete: "Trash2Icon",
};

function actionLabel(action: string, ar: boolean) {
  const known = actionLabels[action];
  if (known) return ar ? known.ar : known.en;
  return action.replaceAll("_", " ");
}

type IconComponent = ComponentType<{ className?: string }>;

function ActionIcon({ action, className }: { action: string; className?: string }) {
  return <IconPlaceholder lucide={actionIcons[action] ?? "ShieldIcon"} className={className} />;
}

function PermissionChip({
  Icon,
  label,
  allowed,
  onChange,
}: {
  Icon: IconComponent;
  label: string;
  allowed: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          onClick={() => onChange(!allowed)}
          aria-label={label}
          variant={allowed ? "default" : "outline"}
          size="icon-sm"
          className={cn(
            "text-muted-foreground hover:text-foreground",
            allowed && "bg-primary/10 text-primary hover:bg-primary/20",
          )}
        >
          <Icon className="size-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default function PermissionsTable({
  roles,
  rows,
  actions,
  ar = false,
  onPermissionChange,
}: PermissionsTableProps) {
  const direction = ar ? "rtl" : "ltr";

  return (
    <Table dir={direction}>
      <TableHeader>
        <TableRow>
          <TableHead className="p-4 font-semibold text-start!">{ar ? "المورد" : "Resource"}</TableHead>
          {roles.map((role) => (
            <TableHead key={role.id} className="p-4 text-start!">
              <span className="block font-semibold">{role.name}</span>
              <span className="block font-normal text-muted-foreground text-xs">
                {role.users.length} {ar ? "مستخدم" : role.users.length === 1 ? "user" : "users"}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.resource}>
            <TableCell className="p-4 font-medium text-start!">{row.label}</TableCell>
            {roles.map((role) => {
              const toggles = role.permissions.find((item) => item.resource === row.resource)?.toggles ?? [];
              return (
                <TableCell key={role.id} className="px-4 text-start!">
                  <div className="flex flex-wrap justify-start gap-1">
                    {actions.map((action) => {
                      const toggle = toggles.find((item) => item.action === action);
                      if (!toggle) return null;
                      const label = actionLabel(action, ar);
                      return (
                        <PermissionChip
                          key={toggle.permissionId}
                          Icon={(props) => <ActionIcon action={action} {...props} />}
                          label={label}
                          allowed={toggle.allowed}
                          onChange={(value) => onPermissionChange(role.id, toggle.permissionId, value)}
                        />
                      );
                    })}
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
