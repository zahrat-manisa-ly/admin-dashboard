"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BellIcon, CheckCheckIcon, ExternalLinkIcon, ListTodoIcon, Trash2Icon } from "lucide-react";

import { usePermissions } from "@/app/(main)/dashboard/_components/access/access.queries";
import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { AccessSkeleton } from "@/app/(main)/dashboard/_components/access/access-skeleton";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { notificationsApi } from "@/lib/api/services/notifications";
import type { Notification, NotificationReadFilter } from "@/lib/api/types/notifications";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

const pageSize = 20;

function NotificationIcon({ icon, unread }: { icon?: string | null; unread: boolean }) {
  if (icon && /^https?:\/\//.test(icon)) {
    return <Image src={icon} alt="" width={36} height={36} unoptimized className="size-9 rounded-full object-cover" />;
  }
  return (
    <div
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full",
        unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      <BellIcon />
    </div>
  );
}

export function NotificationsWorkspace() {
  const { t, formatNumber, formatDateTime } = useI18n();
  const { can } = usePermissions();
  const client = useQueryClient();
  const [filter, setFilter] = useState<NotificationReadFilter>("all");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  //--------list----//
  const listQuery = useInfiniteQuery({
    queryKey: ["notifications-v1", filter],
    queryFn: ({ pageParam, signal }) =>
      notificationsApi.list({ cursor: pageParam, size: pageSize, readStatus: filter }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.next ?? undefined,
    enabled: can("notifications:read"),
    // Keep the inbox cached while moving between dashboard pages.
    staleTime: 60_000,
    refetchOnMount: false,
  });
  //-------end-list----//

  const items = useMemo(() => listQuery.data?.pages.flatMap((page) => page.items) ?? [], [listQuery.data]);
  const summary = listQuery.data?.pages[0];
  const total = summary?.total ?? 0;
  const readCount = summary?.is_read_count ?? 0;
  const unreadCount = Math.max(total - readCount, 0);

  const invalidate = () => client.invalidateQueries({ queryKey: ["notifications-v1"] });

  //--------mutations----//
  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      notify.success(t("notifications.markedRead"));
      void invalidate();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });
  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      notify.success(t("notifications.markedAllRead"));
      void invalidate();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });
  const deleteOne = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      notify.success(t("notifications.deleted"));
      void invalidate();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });
  const deleteAll = useMutation({
    mutationFn: () => notificationsApi.deleteAll(),
    onSuccess: () => {
      setConfirmDeleteAll(false);
      notify.success(t("notifications.deletedAll"));
      void invalidate();
    },
    onError: (error) => notify.error(getApiErrorMessage(error)),
  });
  //-------end-mutations----//

  if (!can("notifications:read")) {
    return <AccessError error={new Error("Forbidden")} retry={() => undefined} busy={false} />;
  }
  if (listQuery.isPending) return <AccessSkeleton />;
  if (!listQuery.data) {
    return <AccessError error={listQuery.error} retry={() => void listQuery.refetch()} busy={listQuery.isFetching} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* //--------header----// */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-tight">{t("notifications.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("notifications.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            {markAllRead.isPending ? <Spinner data-icon="inline-start" /> : <CheckCheckIcon data-icon="inline-start" />}
            {t("notifications.markAllRead")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={total === 0 || deleteAll.isPending}
            onClick={() => setConfirmDeleteAll(true)}
          >
            <Trash2Icon data-icon="inline-start" />
            {t("notifications.deleteAll")}
          </Button>
        </div>
      </div>
      {/* //-------end-header----// */}

      {/* //--------stats----// */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: t("notifications.total"), value: total },
          { label: t("notifications.unreadCount"), value: unreadCount },
          { label: t("notifications.readCount"), value: readCount },
        ].map((stat) => (
          <Card key={stat.label} className="gap-0 py-0">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <span className="text-muted-foreground text-sm">{stat.label}</span>
              <span className="font-semibold text-2xl tabular-nums">{formatNumber(stat.value)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* //-------end-stats----// */}

      {/* //--------inbox----// */}
      <Card className="gap-0 py-0">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2">
                {t("notifications.title")}
                {unreadCount > 0 ? (
                  <Badge variant="secondary" className="bg-primary/10 font-normal text-primary">
                    {formatNumber(unreadCount)}
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>{t("notifications.description")}</CardDescription>
            </div>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as NotificationReadFilter)}>
              <TabsList variant="line">
                <TabsTrigger value="all">{t("notifications.all")}</TabsTrigger>
                <TabsTrigger value="unread">{t("notifications.unread")}</TabsTrigger>
                <TabsTrigger value="read">{t("notifications.read")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="px-0" aria-busy={listQuery.isFetching}>
          {items.length === 0 ? (
            <div className="p-6">
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BellIcon />
                  </EmptyMedia>
                  <EmptyTitle>{t("notifications.emptyTitle")}</EmptyTitle>
                  <EmptyDescription>{t("notifications.emptyDescription")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <ul className="flex flex-col">
              {items.map((notification, index) => (
                <li key={notification.id}>
                  {index > 0 ? <Separator /> : null}
                  <NotificationRow
                    notification={notification}
                    createdLabel={formatDateTime(notification.created_at)}
                    t={t}
                    busy={
                      (markRead.isPending && markRead.variables === notification.id) ||
                      (deleteOne.isPending && deleteOne.variables === notification.id)
                    }
                    onMarkRead={() => markRead.mutate(notification.id)}
                    onDelete={() => deleteOne.mutate(notification.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {listQuery.hasNextPage ? (
            <div className="border-t p-4">
              <Button
                variant="outline"
                className="w-full"
                disabled={listQuery.isFetchingNextPage}
                onClick={() => void listQuery.fetchNextPage()}
              >
                {listQuery.isFetchingNextPage ? <Spinner data-icon="inline-start" /> : null}
                {t("notifications.loadMore")}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      {/* //-------end-inbox----// */}

      {/* //--------confirm-delete-all----// */}
      <AlertDialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("notifications.confirmDeleteAllTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("notifications.confirmDeleteAllDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAll.isPending}>{t("notifications.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteAll.isPending}
              onClick={(event) => {
                event.preventDefault();
                deleteAll.mutate();
              }}
            >
              {deleteAll.isPending ? <Spinner data-icon="inline-start" /> : null}
              {t("notifications.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* //-------end-confirm-delete-all----// */}
    </div>
  );
}

function NotificationRow({
  notification,
  createdLabel,
  t,
  busy,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  createdLabel: string;
  t: (id: string) => string;
  busy: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const unread = !(notification.is_read ?? false);

  return (
    <div className={cn("flex items-start gap-3 px-4 py-3", unread && "bg-primary/5", busy && "opacity-60")}>
      <NotificationIcon icon={notification.icon} unread={unread} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className={cn("text-sm", unread ? "font-medium text-foreground" : "text-foreground")}>
            {notification.body}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <span>{createdLabel}</span>
            {notification.is_todo ? (
              <Badge variant="outline" className="gap-1 font-normal">
                <ListTodoIcon />
                {t("notifications.todo")}
              </Badge>
            ) : null}
            {unread ? <span className="size-1.5 rounded-full bg-primary" aria-hidden /> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {notification.url ? (
            <Button variant="secondary" size="sm" asChild>
              <a href={notification.url} target="_blank" rel="noreferrer">
                <ExternalLinkIcon data-icon="inline-start" />
                {t("notifications.open")}
              </a>
            </Button>
          ) : null}
          {unread ? (
            <Button variant="ghost" size="sm" disabled={busy} onClick={onMarkRead}>
              <CheckCheckIcon data-icon="inline-start" />
              {t("notifications.markRead")}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" disabled={busy} onClick={onDelete}>
            <Trash2Icon data-icon="inline-start" />
            {t("notifications.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
