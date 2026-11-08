"use client";

// React Imports
import { useState } from "react";

// Third-party Imports
import { toast } from "sonner";

import RoleFormDialog from "@/components/shadcn-studio/blocks/roles-permission-application-01/content/role-form-dialog";
// Type Imports
import type {
  AppRole,
  ResourcePermissions,
} from "@/components/shadcn-studio/blocks/roles-permission-application-01/roles-permission-application-01";
// Component Imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

type RoleCardProps = {
  role: AppRole;
  ar?: boolean;
  onUpdateRole?: (roleId: string, values: { name: string; permissions: ResourcePermissions[] }) => Promise<void>;
  onDeleteRole?: (roleId: string) => Promise<void>;
};

const basicActions = ["read", "create", "update", "delete"] as const;

const actionLabels: Record<(typeof basicActions)[number], { en: string; ar: string }> = {
  read: { en: "View", ar: "عرض" },
  create: { en: "Add", ar: "إضافة" },
  update: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
};

const RoleCard = ({
  role,
  template = [],
  ar = false,
  onUpdateRole,
  onDeleteRole,
}: RoleCardProps & { template?: ResourcePermissions[] }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const toggles = role.permissions.flatMap((row) => row.toggles);
  const permCounts = basicActions.map((action) => ({
    label: ar ? actionLabels[action].ar : actionLabels[action].en,
    count: toggles.filter((toggle) => toggle.action === action && toggle.allowed).length,
  }));
  const total = permCounts.reduce((sum, item) => sum + item.count, 0);

  const handleConfirmDelete = async () => {
    try {
      if (onDeleteRole) await onDeleteRole(role.id);
      else toast.success(`${role.name} role deleted`);
      setDeleteDialogOpen(false);
    } catch {
      setDeleteDialogOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex justify-between gap-2">
            <h4 className="min-w-0 font-medium text-base leading-tight">{role.name}</h4>
            {(onUpdateRole ?? onDeleteRole) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="More actions">
                    <IconPlaceholder
                      lucide="EllipsisVerticalIcon"
                      tabler="IconDotsVertical"
                      hugeicons="EllipsisVertical"
                      phosphor="DotsThreeVerticalIcon"
                      remixicon="RiMore2Line"
                      className="size-4"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onUpdateRole && (
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      <IconPlaceholder
                        lucide="PencilIcon"
                        tabler="IconPencil"
                        hugeicons="Edit03Icon"
                        phosphor="PencilIcon"
                        remixicon="RiPencilLine"
                        className="size-4"
                      />
                      {ar ? "تعديل الدور" : "Edit Role"}
                    </DropdownMenuItem>
                  )}
                  {onDeleteRole && (
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                      <IconPlaceholder
                        lucide="Trash2Icon"
                        tabler="IconTrash"
                        hugeicons="Delete02Icon"
                        phosphor="TrashIcon"
                        remixicon="RiDeleteBinLine"
                        className="size-4"
                      />
                      {ar ? "حذف الدور" : "Delete Role"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
            {permCounts.map(({ label, count }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="font-semibold text-foreground text-sm">{count}</span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="h-6 w-px bg-border" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-semibold text-foreground text-sm">{total}</span>
              <span className="text-[10px] text-muted-foreground">{ar ? "المجموع" : "Total"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoleFormDialog
        role={role}
        template={template}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        ar={ar}
        onSubmit={onUpdateRole ? (values) => onUpdateRole(role.id, values) : undefined}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ar ? "حذف هذا الدور؟" : "Delete this role?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {ar
                ? `هل تريد حذف دور «${role.name}»؟ لا يمكن التراجع عن هذه العملية.`
                : `Are you sure you want to delete the “${role.name}” role? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ar ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDelete()}>{ar ? "حذف" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoleCard;
