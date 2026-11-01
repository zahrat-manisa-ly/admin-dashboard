"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, Mail, Undo2 } from "lucide-react";

import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import {
  type DirectoryRow,
  type DirectoryStatusTone,
  UserDatatable,
} from "@/components/shadcn-studio/blocks/datatable-user/user-datatable";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { usersApi } from "@/lib/api/services/users";
import type { RoleWithPermissionsResponse } from "@/lib/api/types/authorization";
import type { Invitation } from "@/lib/api/types/users";
import { notify } from "@/lib/notify";

type InvitationsTableProps = {
  ar: boolean;
  page: number;
  pageSize: number;
  search: string;
  roleId: string;
  roles: RoleWithPermissionsResponse[];
  formatNumber: (value: number) => string;
  canManage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

function invitationTone(invitation: Invitation): { tone: DirectoryStatusTone; label: { ar: string; en: string } } {
  if (invitation.revoked_at) return { tone: "danger", label: { ar: "ملغاة", en: "Revoked" } };
  if (invitation.accepted_at) return { tone: "success", label: { ar: "مقبولة", en: "Accepted" } };
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return { tone: "muted", label: { ar: "منتهية", en: "Expired" } };
  }
  return { tone: "pending", label: { ar: "معلّقة", en: "Pending" } };
}

function canChange(invitation: Invitation) {
  return !invitation.accepted_at && !invitation.revoked_at;
}

export function InvitationsTable({
  ar,
  page,
  pageSize,
  search,
  roleId,
  roles,
  formatNumber,
  canManage,
  onPageChange,
  onPageSizeChange,
}: InvitationsTableProps) {
  const client = useQueryClient();
  const [revoking, setRevoking] = useState<Invitation | null>(null);
  const invitationsQuery = useQuery({
    queryKey: ["users-v1", "invitations", page, pageSize],
    queryFn: ({ signal }) => usersApi.invitations({ page, size: pageSize, includeHistory: false }, signal),
  });

  const invalidate = () => client.invalidateQueries({ queryKey: ["users-v1", "invitations"] });

  const resend = useMutation({
    mutationFn: (id: string) => usersApi.resendInvitation(id),
    onSuccess: async () => {
      notify.success(ar ? "أُعيد إرسال الدعوة" : "Invitation resent");
      await invalidate();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => usersApi.revokeInvitation(id),
    onSuccess: async () => {
      notify.success(ar ? "أُلغيت الدعوة" : "Invitation revoked");
      setRevoking(null);
      await invalidate();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });

  if (invitationsQuery.isPending) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!invitationsQuery.data) {
    return (
      <div className="p-4">
        <AccessError
          error={invitationsQuery.error}
          retry={() => void invitationsQuery.refetch()}
          busy={invitationsQuery.isFetching}
        />
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const date = (value: string) =>
    new Intl.DateTimeFormat(ar ? "ar" : "en", { dateStyle: "medium" }).format(new Date(value));

  const rows: DirectoryRow[] = invitationsQuery.data.items
    .filter((invitation) => {
      if (roleId !== "all" && !invitation.role_ids.includes(roleId)) return false;
      if (!query) return true;
      return `${invitation.first_name} ${invitation.last_name} ${invitation.email}`.toLowerCase().includes(query);
    })
    .map((invitation) => {
      const status = invitationTone(invitation);
      const roleNames = invitation.role_ids
        .map((id) => roles.find((role) => role.id === id)?.name)
        .filter((name): name is string => Boolean(name));
      const name = `${invitation.first_name} ${invitation.last_name}`.trim();

      return {
        id: invitation.id,
        name,
        email: invitation.email,
        detail: roleNames.join(", "),
        extra: date(invitation.expires_at),
        statusLabel: status.label[ar ? "ar" : "en"],
        statusTone: status.tone,
        actions: canManage ? (
          <InvitationActions
            ar={ar}
            name={name}
            disabled={!canChange(invitation)}
            resendPending={resend.isPending && resend.variables === invitation.id}
            onResend={() => resend.mutate(invitation.id)}
            onRevoke={() => setRevoking(invitation)}
          />
        ) : undefined,
      };
    });

  return (
    <>
      <div aria-busy={invitationsQuery.isFetching}>
        <UserDatatable
          rows={rows}
          page={invitationsQuery.data.page}
          pageSize={invitationsQuery.data.size}
          total={invitationsQuery.data.total}
          pages={invitationsQuery.data.pages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          formatNumber={formatNumber}
          showActions={canManage}
          headers={{
            person: ar ? "المدعو" : "Invitee",
            detail: ar ? "الدور" : "Role",
            extra: ar ? "تنتهي في" : "Expires",
            status: ar ? "الحالة" : "Status",
            actions: ar ? "إجراءات" : "Actions",
          }}
          labels={{
            showing: ar ? "عرض {start} إلى {end} من {total}" : "Showing {start} to {end} of {total} entries",
            previous: ar ? "السابق" : "Previous",
            next: ar ? "التالي" : "Next",
            rowsPerPage: ar ? "صفوف لكل صفحة" : "Rows per page",
            emptyTitle: ar ? "لا توجد دعوات معلّقة" : "No pending invitations",
            emptyDescription: ar
              ? "ستظهر الدعوات هنا بعد إرسالها، أو جرّب تغيير البحث."
              : "Invitations appear here after they are sent, or try a different search.",
          }}
        />
      </div>
      <AlertDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => {
          if (!open && !revoke.isPending) setRevoking(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ar ? "إلغاء الدعوة" : "Revoke invitation"}</AlertDialogTitle>
            <AlertDialogDescription>
              {ar
                ? `لن يتمكن ${revoking?.email ?? ""} من قبول هذه الدعوة.`
                : `${revoking?.email ?? "This person"} will no longer be able to accept this invitation.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>{ar ? "تراجع" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revoke.isPending || !revoking}
              onClick={(event) => {
                event.preventDefault();
                if (revoking) revoke.mutate(revoking.id);
              }}
            >
              {revoke.isPending ? <Spinner data-icon="inline-start" /> : null}
              {ar ? "إلغاء الدعوة" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InvitationActions({
  ar,
  name,
  disabled,
  resendPending,
  onResend,
  onRevoke,
}: {
  ar: boolean;
  name: string;
  disabled: boolean;
  resendPending: boolean;
  onResend: () => void;
  onRevoke: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label={ar ? `إجراءات ${name}` : `Actions for ${name}`}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={disabled || resendPending} onClick={onResend}>
            {resendPending ? <Spinner data-icon="inline-start" /> : <Mail data-icon="inline-start" />}
            {ar ? "إعادة الإرسال" : "Resend"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" disabled={disabled} onClick={onRevoke}>
            <Undo2 data-icon="inline-start" />
            {ar ? "إلغاء الدعوة" : "Revoke"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
