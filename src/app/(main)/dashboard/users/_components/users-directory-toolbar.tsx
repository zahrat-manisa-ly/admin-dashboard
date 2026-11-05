"use client";

import { Search, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RoleWithPermissionsResponse } from "@/lib/api/types/authorization";

import type { UsersUiStatus } from "./users-filters";

type UsersDirectoryToolbarProps = {
  ar: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  status: UsersUiStatus | "all";
  onStatusChange: (value: UsersUiStatus | "all") => void;
  roleId: string;
  onRoleChange: (value: string) => void;
  roles: RoleWithPermissionsResponse[];
  canInvite: boolean;
  inviteDisabled: boolean;
  onInvite: () => void;
};

export function UsersDirectoryToolbar({
  ar,
  search,
  onSearchChange,
  status,
  onStatusChange,
  roleId,
  onRoleChange,
  roles,
  canInvite,
  inviteDisabled,
  onInvite,
}: UsersDirectoryToolbarProps) {
  const statusOptions: { value: UsersUiStatus | "all"; label: string }[] = [
    { value: "all", label: ar ? "كل الحالات" : "All statuses" },
    { value: "active", label: ar ? "نشط" : "Active" },
    { value: "invited", label: ar ? "دعوة معلّقة" : "Pending invite" },
    { value: "suspended", label: ar ? "موقوف" : "Suspended" },
  ];

  return (
    <div className="flex flex-col gap-4 border-b px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-medium text-sm">{ar ? "تصفية" : "Filter"}</span>
        {canInvite && (
          <Button size="sm" onClick={onInvite} disabled={inviteDisabled}>
            <UserPlus data-icon="inline-start" />
            {ar ? "دعوة مستخدم" : "Invite user"}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="min-w-0 flex-1 gap-1.5">
          <FieldLabel htmlFor="users-directory-search">{ar ? "بحث" : "Search"}</FieldLabel>
          <InputGroup className="h-9 w-full">
            <InputGroupAddon align="inline-start">
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              id="users-directory-search"
              className="h-9"
              placeholder={ar ? "الاسم، البريد، أو الهاتف" : "Name, email, or phone"}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
        </Field>

        <div className="flex shrink-0 items-end gap-3 self-end sm:self-auto">
          <Field className="w-auto gap-1.5">
            <FieldLabel htmlFor="users-directory-role">{ar ? "الدور" : "Role"}</FieldLabel>
            <Select value={roleId} onValueChange={onRoleChange}>
              <SelectTrigger id="users-directory-role" size="sm" className="min-w-40">
                <SelectValue placeholder={ar ? "كل الأدوار" : "All roles"} />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  <SelectItem value="all">{ar ? "كل الأدوار" : "All roles"}</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field className="w-auto gap-1.5">
            <FieldLabel htmlFor="users-directory-status">{ar ? "الحالة" : "Status"}</FieldLabel>
            <Select value={status} onValueChange={(value) => onStatusChange(value as UsersUiStatus | "all")}>
              <SelectTrigger id="users-directory-status" size="sm" className="min-w-40">
                <SelectValue placeholder={ar ? "كل الحالات" : "All statuses"} />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    </div>
  );
}
