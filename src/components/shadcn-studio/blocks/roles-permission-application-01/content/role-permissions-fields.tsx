"use client";

import type { Control, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

import type { RoleFormValues } from "@/components/shadcn-studio/blocks/roles-permission-application-01/content/role-form-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { comparePermissionActions } from "@/lib/auth/permissions";

type RolePermissionsFieldsProps = {
  control: Control<RoleFormValues>;
  setValue: UseFormSetValue<RoleFormValues>;
};

export default function RolePermissionsFields({ control, setValue }: RolePermissionsFieldsProps) {
  const current = useWatch({ control, name: "permissions" }) ?? [];
  const actions = [...new Set(current.map((item) => item.action))].sort(comparePermissionActions);
  const resources = [...new Set(current.map((item) => item.resource))];

  function setAllowed(indexes: number[], allowed: boolean) {
    for (const index of indexes) {
      setValue(`permissions.${index}.allowed`, allowed, { shouldDirty: true, shouldTouch: true });
    }
  }

  const allSelected = current.length > 0 && current.every((item) => item.allowed);
  const someSelected = current.some((item) => item.allowed) && !allSelected;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48 p-3 font-bold">Resource</TableHead>
          <TableHead className="p-3!">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(value) =>
                setAllowed(
                  current.map((_, index) => index),
                  value === true,
                )
              }
              aria-label="Select all permissions"
              className="mx-auto"
            />
          </TableHead>
          {actions.map((action) => (
            <TableHead key={action} className="p-3 text-center capitalize">
              {action.replaceAll("_", " ")}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => {
          const indexes = current.flatMap((item, index) => (item.resource === resource ? [index] : []));
          const rowItems = indexes.map((index) => current[index]).filter((item) => item != null);
          const allForRow = rowItems.length > 0 && rowItems.every((item) => item.allowed);
          const someForRow = rowItems.some((item) => item.allowed) && !allForRow;
          return (
            <TableRow key={resource}>
              <TableCell className="p-3 font-bold">{resource.replaceAll("_", " ")}</TableCell>
              <TableCell className="p-3!">
                <Checkbox
                  checked={allForRow ? true : someForRow ? "indeterminate" : false}
                  onCheckedChange={(value) => setAllowed(indexes, value === true)}
                  aria-label={`Select all for ${resource}`}
                  className="mx-auto"
                />
              </TableCell>
              {actions.map((action) => {
                const index = current.findIndex((item) => item.resource === resource && item.action === action);
                if (index < 0) {
                  return <TableCell key={action} className="p-3" />;
                }
                return (
                  <TableCell key={action} className="p-3">
                    <Controller
                      control={control}
                      name={`permissions.${index}.allowed`}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(value) => field.onChange(value === true)}
                          aria-label={`${resource} ${action}`}
                          className="mx-auto"
                        />
                      )}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
