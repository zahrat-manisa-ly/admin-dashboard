"use client";

import { useMemo, useState } from "react";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, Pencil, Trash2, UserX } from "lucide-react";

import { usePermissions } from "@/app/(main)/dashboard/_components/access/access.queries";
import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { AccessSkeleton } from "@/app/(main)/dashboard/_components/access/access-skeleton";
import { DeleteDialog } from "@/app/(main)/dashboard/_components/access/delete-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { usersApi } from "@/lib/api/services/users";
import type { User } from "@/lib/api/types/users";
import { notify } from "@/lib/notify";

import { InvitationsTable } from "./invitations-table";
import { UserEditor } from "./user-editor";
import { UsersDirectoryToolbar } from "./users-directory-toolbar";
import {
  filterUsers,
  filterUsersByRoleId,
  isTeamDirectoryUser,
  userDirectoryStats,
  useUsersFilters,
} from "./users-filters";
import { UsersStatsCards } from "./users-stats-cards";

const SNAPSHOT_CAP = 200;

export function UsersWorkspace() {
  const { locale, formatNumber } = useI18n();
  const ar = locale === "ar";
  const { can, currentUser } = usePermissions();
  const client = useQueryClient();
  const { params, search, setSearch, update } = useUsersFilters();
  const [editor, setEditor] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users-v1", params.page, params.pageSize],
    queryFn: ({ signal }) => usersApi.list(params.page, params.pageSize, signal),
    placeholderData: keepPreviousData,
    enabled: can("users:read"),
  });

  const total = usersQuery.data?.total ?? 0;
  const snapshotQuery = useQuery({
    queryKey: ["users-v1", "snapshot", total],
    queryFn: ({ signal }) => usersApi.list(1, Math.min(total, SNAPSHOT_CAP), signal),
    enabled: can("users:read") && total > 0,
    staleTime: 60_000,
  });

  const rolesQuery = useQuery({
    queryKey: ["users-v1", "roles"],
    queryFn: ({ signal }) => usersApi.roles(signal),
    enabled: can("users:create") || can("roles:read"),
  });

  const invitationsCount = useQuery({
    queryKey: ["users-v1", "invitations", "count"],
    queryFn: ({ signal }) => usersApi.invitations({ page: 1, size: 1 }, signal),
    enabled: can("users:read"),
  });

  const invalidate = () => client.invalidateQueries({ queryKey: ["users-v1"] });

  const blocking = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => usersApi.setBlocked(id, blocked),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const removal = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: async () => {
      await invalidate();
    },
  });

  const filteredItems = useMemo(() => {
    const source = usersQuery.data?.items ?? [];
    const team = filterUsers(source, {
      search: params.search,
      status: params.status,
      accountType: "employee",
    });
    return filterUsersByRoleId(team, params.roleId);
  }, [usersQuery.data?.items, params.search, params.status, params.roleId]);

  const teamSnapshot = useMemo(
    () => (snapshotQuery.data?.items ?? usersQuery.data?.items ?? []).filter(isTeamDirectoryUser),
    [snapshotQuery.data?.items, usersQuery.data?.items],
  );

  const stats = useMemo(
    () => ({
      ...userDirectoryStats(teamSnapshot, teamSnapshot.length),
      pending: invitationsCount.data?.total ?? 0,
    }),
    [invitationsCount.data?.total, teamSnapshot],
  );

  const showingInvites = params.status === "invited";

  if (usersQuery.isPending) return <AccessSkeleton />;
  if (!usersQuery.data)
    return (
      <AccessError error={usersQuery.error} retry={() => void usersQuery.refetch()} busy={usersQuery.isFetching} />
    );

  const { pages } = usersQuery.data;
  const date = (value: string) =>
    new Intl.DateTimeFormat(ar ? "ar" : "en", { dateStyle: "medium" }).format(new Date(value));

  const pageCount = Math.max(pages, 1);
  const currentPage = Math.min(params.page, pageCount);
  const rowStart = filteredItems.length ? (currentPage - 1) * params.pageSize + 1 : 0;
  const rowEnd = filteredItems.length ? rowStart + filteredItems.length - 1 : 0;
  const hasActiveFilters = Boolean(params.search.trim()) || params.status !== "all" || params.roleId !== "all";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">{ar ? "المستخدمون" : "Users"}</h1>
        <p className="text-muted-foreground text-sm">
          {ar ? "عرض المستخدمين ودعوتهم وتعديل بياناتهم وإدارتهم." : "View, invite, edit, and manage dashboard users."}
        </p>
      </div>

      <UsersStatsCards
        total={stats.total}
        active={stats.active}
        pending={stats.pending}
        suspended={stats.suspended}
        formatNumber={formatNumber}
        ar={ar}
        pendingActive={showingInvites}
        onPending={() => update({ status: showingInvites ? "all" : "invited", page: 1 })}
      />

      {rolesQuery.isError && (
        <AccessError error={rolesQuery.error} retry={() => void rolesQuery.refetch()} busy={rolesQuery.isFetching} />
      )}
      {usersQuery.isError && (
        <AccessError error={usersQuery.error} retry={() => void usersQuery.refetch()} busy={usersQuery.isFetching} />
      )}
      {blocking.isError && <AccessError error={blocking.error} />}

      <Card className="gap-0 py-0">
        <UsersDirectoryToolbar
          ar={ar}
          search={search}
          onSearchChange={setSearch}
          status={params.status}
          onStatusChange={(value) => update({ status: value, page: 1 })}
          roleId={params.roleId}
          onRoleChange={(value) => update({ roleId: value, page: 1 })}
          roles={rolesQuery.data ?? []}
          canInvite={can("users:create")}
          inviteDisabled={!rolesQuery.data?.length}
          onInvite={() => setEditor("new")}
        />

        <CardContent className="px-0" aria-busy={usersQuery.isFetching}>
          {showingInvites ? (
            <InvitationsTable
              ar={ar}
              page={params.page}
              pageSize={params.pageSize}
              search={params.search}
              roleId={params.roleId}
              roles={rolesQuery.data ?? []}
              formatNumber={formatNumber}
              canManage={can("users:create")}
              onPageChange={(page) => update({ page })}
              onPageSizeChange={(pageSize) => update({ pageSize, page: 1 })}
            />
          ) : filteredItems.length ? (
            <div className="overflow-x-auto">
              <Table className="**:data-[slot=table-cell]:px-4 **:data-[slot=table-head]:px-4">
                <TableHeader className="bg-neutral-100 dark:bg-muted/60 [&_tr]:border-b">
                  <TableRow className="border-t bg-neutral-100 hover:bg-neutral-100 dark:bg-muted/60 dark:hover:bg-muted/60">
                    <TableHead className="h-12 ps-4 text-start font-normal text-muted-foreground">
                      {ar ? "الاسم" : "Name"}
                    </TableHead>
                    <TableHead className="h-12 text-start font-normal text-muted-foreground">
                      {ar ? "البريد" : "Email"}
                    </TableHead>
                    <TableHead className="h-12 text-start font-normal text-muted-foreground">
                      {ar ? "الهاتف" : "Phone"}
                    </TableHead>
                    <TableHead className="h-12 text-start font-normal text-muted-foreground">
                      {ar ? "الدور" : "Role"}
                    </TableHead>
                    <TableHead className="h-12 text-start font-normal text-muted-foreground">
                      {ar ? "الحالة" : "Status"}
                    </TableHead>
                    <TableHead className="h-12 text-start font-normal text-muted-foreground">
                      {ar ? "تاريخ الانضمام" : "Joined"}
                    </TableHead>
                    <TableHead className="h-12 pe-4 text-end font-normal text-muted-foreground">
                      {ar ? "إجراءات" : "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((user) => {
                    const name = `${user.first_name} ${user.last_name}`.trim();
                    const protectedUser = user.is_owner || user.id === currentUser?.id;
                    const roleLabel = user.roles?.[0]?.name ?? "—";

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="ps-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.first_name[0]}
                                {user.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 font-medium">{name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground" dir="ltr">
                          {user.email ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground" dir="ltr">
                          {user.phone_number ?? "—"}
                        </TableCell>
                        <TableCell>{roleLabel}</TableCell>
                        <TableCell>
                          {user.is_blocked ? (
                            <Badge variant="destructive" className="gap-1.5">
                              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                              {ar ? "موقوف" : "Suspended"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1.5 bg-success/15 text-success">
                              <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                              {ar ? "نشط" : "Active"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{date(user.created_at)}</TableCell>
                        <TableCell className="pe-4">
                          <div className="flex justify-end">
                            <UserRowActions
                              user={user}
                              ar={ar}
                              name={name}
                              canEdit={can("employee:update")}
                              canBlock={can("users:manage_blocking")}
                              canDelete={can("users:delete")}
                              protectedUser={protectedUser}
                              blockPending={blocking.isPending && blocking.variables?.id === user.id}
                              onEdit={() => setEditor(user.id)}
                              onDelete={() => setDeleting(user)}
                              onToggleBlock={() =>
                                blocking.mutate(
                                  { id: user.id, blocked: !user.is_blocked },
                                  {
                                    onSuccess: () =>
                                      notify.success(
                                        user.is_blocked
                                          ? ar
                                            ? "تم إلغاء الإيقاف"
                                            : "User unsuspended"
                                          : ar
                                            ? "تم الإيقاف"
                                            : "User suspended",
                                      ),
                                    onError: (error) => notify.error(getApiErrorMessage(error)),
                                  },
                                )
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter className="border-t bg-transparent">
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0">
                      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground text-sm">
                          {ar
                            ? `عرض ${formatNumber(rowStart)} إلى ${formatNumber(rowEnd)} من ${formatNumber(total)}`
                            : `Showing ${formatNumber(rowStart)} to ${formatNumber(rowEnd)} of ${formatNumber(total)} entries`}
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm">
                              {ar ? "صفوف لكل صفحة" : "Rows per page"}
                            </span>
                            <Select
                              value={`${params.pageSize}`}
                              onValueChange={(value) => update({ pageSize: Number(value), page: 1 })}
                            >
                              <SelectTrigger size="sm" className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent position="popper" align="end">
                                <SelectGroup>
                                  {[5, 10, 25, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                      {formatNumber(size)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>

                          <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  href="#"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    if (currentPage > 1) update({ page: currentPage - 1 });
                                  }}
                                  className={
                                    currentPage <= 1 || usersQuery.isFetching
                                      ? "pointer-events-none opacity-50"
                                      : undefined
                                  }
                                />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink href="#" isActive onClick={(event) => event.preventDefault()}>
                                  {formatNumber(currentPage)}
                                </PaginationLink>
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationNext
                                  href="#"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    if (currentPage < pageCount) update({ page: currentPage + 1 });
                                  }}
                                  className={
                                    currentPage >= pageCount || usersQuery.isFetching
                                      ? "pointer-events-none opacity-50"
                                      : undefined
                                  }
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          ) : (
            <Empty className="min-h-48">
              <EmptyHeader>
                <EmptyTitle>{ar ? "لا توجد نتائج" : "No results"}</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? ar
                      ? "جرّب تغيير البحث أو الفلاتر، أو انتقل إلى صفحة أخرى."
                      : "Try changing search or filters, or go to another page."
                    : ar
                      ? "ستظهر الحسابات هنا بعد إنشائها."
                      : "Accounts will appear here once created."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      {editor && (
        <UserEditor
          key={editor}
          userId={editor === "new" ? undefined : editor}
          roles={rolesQuery.data ?? []}
          ar={ar}
          onClose={() => setEditor(null)}
          onSaved={() => void invalidate()}
        />
      )}
      {deleting && (
        <DeleteDialog
          name={`${deleting.first_name} ${deleting.last_name}`}
          onClose={() => setDeleting(null)}
          onDelete={async () => {
            await removal.mutateAsync(deleting.id);
            const remaining = filteredItems.length;
            if (remaining === 1 && params.page > 1) update({ page: params.page - 1 });
          }}
        />
      )}
    </div>
  );
}

type UserRowActionsProps = {
  user: User;
  ar: boolean;
  name: string;
  canEdit: boolean;
  canBlock: boolean;
  canDelete: boolean;
  protectedUser: boolean;
  blockPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleBlock: () => void;
};

function UserRowActions({
  user,
  ar,
  name,
  canEdit,
  canBlock,
  canDelete,
  protectedUser,
  blockPending,
  onEdit,
  onDelete,
  onToggleBlock,
}: UserRowActionsProps) {
  if (!canEdit && !canBlock && !canDelete) return null;

  const suspendLabel = user.is_blocked ? (ar ? "إلغاء الإيقاف" : "Unsuspend") : ar ? "إيقاف" : "Suspend";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          className="size-8 text-muted-foreground"
          aria-label={ar ? `إجراءات ${name}` : `Actions for ${name}`}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canEdit && user.account_type === "employee" && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil data-icon="inline-start" />
              {ar ? "تعديل" : "Edit"}
            </DropdownMenuItem>
          )}
          {canBlock && (
            <DropdownMenuItem disabled={protectedUser || blockPending} onClick={onToggleBlock}>
              {blockPending ? <Spinner data-icon="inline-start" /> : <UserX data-icon="inline-start" />}
              {suspendLabel}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" disabled={protectedUser} onClick={onDelete}>
                <Trash2 data-icon="inline-start" />
                {ar ? "حذف" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
