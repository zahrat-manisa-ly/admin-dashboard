"use client";

// React Imports
import { useState } from "react";

import RoleCard from "@/components/shadcn-studio/blocks/roles-permission-application-01/content/role-card";
import RoleFormDialog from "@/components/shadcn-studio/blocks/roles-permission-application-01/content/role-form-dialog";
// Type Imports
import type {
  AppRoleWithUsers,
  ResourcePermissions,
} from "@/components/shadcn-studio/blocks/roles-permission-application-01/roles-permission-application-01";
// Component Imports
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

type RoleFormPayload = { name: string; permissions: ResourcePermissions[] };

type RolesGridProps = {
  roles: AppRoleWithUsers[];
  template: ResourcePermissions[];
  ar?: boolean;
  onCreateRole?: (values: RoleFormPayload) => Promise<void>;
  onUpdateRole?: (roleId: string, values: RoleFormPayload) => Promise<void>;
  onDeleteRole?: (roleId: string) => Promise<void>;
};

const RolesGrid = ({ roles, template, ar = false, onCreateRole, onUpdateRole, onDeleteRole }: RolesGridProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          template={template}
          ar={ar}
          onUpdateRole={onUpdateRole}
          onDeleteRole={onDeleteRole}
        />
      ))}

      {onCreateRole && (
        <Card className="items-center justify-center">
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="font-medium text-lg">{ar ? "إضافة دور" : "Add New Role"}</p>
              <p className="mt-1 text-muted-foreground text-sm">
                {ar ? "أضف دورًا إذا لم يكن موجودًا." : "Add a role, if it does not exist."}
              </p>
            </div>
            <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
              <IconPlaceholder
                lucide="PlusIcon"
                tabler="IconPlus"
                hugeicons="PlusSignIcon"
                phosphor="PlusIcon"
                remixicon="RiAddLine"
                className="size-4"
              />
              {ar ? "إضافة دور" : "Add New Role"}
            </Button>
          </CardContent>
        </Card>
      )}

      {onCreateRole && (
        <RoleFormDialog
          template={template}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          ar={ar}
          onSubmit={onCreateRole}
        />
      )}
    </div>
  );
};

export default RolesGrid;
