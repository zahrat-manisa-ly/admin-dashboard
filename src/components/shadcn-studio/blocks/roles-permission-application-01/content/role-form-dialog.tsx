"use client";

// React Imports
import { useEffect, useRef } from "react";

// Third-party Imports
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import RolePermissionsFields from "@/components/shadcn-studio/blocks/roles-permission-application-01/content/role-permissions-fields";
// Type Imports
import type {
  AppRole,
  ResourcePermissions,
} from "@/components/shadcn-studio/blocks/roles-permission-application-01/roles-permission-application-01";
// Component Imports
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const permissionFieldSchema = z.object({
  permissionId: z.string(),
  resource: z.string(),
  action: z.string(),
  allowed: z.boolean(),
});

const roleFormSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  permissions: z.array(permissionFieldSchema),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

const flatten = (rows: ResourcePermissions[], keepAllowed: boolean): RoleFormValues["permissions"] =>
  rows.flatMap((row) =>
    row.toggles.map((toggle) => ({
      permissionId: toggle.permissionId,
      resource: row.resource,
      action: toggle.action,
      allowed: keepAllowed ? toggle.allowed : false,
    })),
  );

const toRows = (fields: RoleFormValues["permissions"]): ResourcePermissions[] => {
  const rows = new Map<string, ResourcePermissions>();
  for (const field of fields) {
    const row = rows.get(field.resource) ?? {
      resource: field.resource,
      label: field.resource.replaceAll("_", " "),
      toggles: [],
    };
    row.toggles.push({ permissionId: field.permissionId, action: field.action, allowed: field.allowed });
    rows.set(field.resource, row);
  }
  return [...rows.values()];
};

const buildDefaultValues = (rows: ResourcePermissions[], role?: AppRole): RoleFormValues => ({
  name: role?.name ?? "",
  permissions: flatten(role?.permissions ?? rows, Boolean(role)),
});

type RoleFormDialogProps = {
  role?: AppRole;
  template: ResourcePermissions[];
  open: boolean;
  ar?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: { name: string; permissions: ResourcePermissions[] }) => Promise<void> | void;
};

const RoleFormDialog = ({ role, template, open, ar = false, onOpenChange, onSubmit }: RoleFormDialogProps) => {
  const isEditing = !!role;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: buildDefaultValues(template, role),
  });

  const _roleId = role?.id ?? "new";
  const sourceRef = useRef({ template, role });
  sourceRef.current = { template, role };

  useEffect(() => {
    if (!open) return;
    const { template: nextTemplate, role: nextRole } = sourceRef.current;
    reset(buildDefaultValues(nextTemplate, nextRole));
  }, [open, reset]);

  const submit = async (values: RoleFormValues) => {
    try {
      if (onSubmit) await onSubmit({ name: values.name, permissions: toRows(values.permissions) });
      else toast.success(isEditing ? "Role updated" : "Role created");
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {isEditing ? (ar ? "تعديل الدور" : "Edit Role") : ar ? "إضافة دور" : "Add New Role"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? ar
                ? "حدّث اسم الدور وصلاحيات الموارد."
                : "Update the role name and its resource permissions."
              : ar
                ? "أنشئ دورًا جديدًا واضبط صلاحياته."
                : "Create a new role and configure its permissions."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => void submit(values))}
          noValidate
          className="flex min-w-0 flex-col gap-6"
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name" className="font-bold">
                  {ar ? "اسم الدور" : "Role Name"}
                </FieldLabel>
                <Input id="name" placeholder="e.g. Finance Manager" {...field} />
                <FieldError errors={[errors.name]} />
              </Field>
            )}
          />

          <div className="flex flex-col gap-3">
            <p className="font-medium text-sm">{ar ? "صلاحيات الدور" : "Role Permissions"}</p>
            <div className="overflow-x-auto rounded-lg border">
              <RolePermissionsFields control={control} setValue={setValue} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {ar ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? (ar ? "حفظ" : "Save Changes") : ar ? "إنشاء الدور" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleFormDialog;
