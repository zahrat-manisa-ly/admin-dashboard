"use client";

import { useMemo } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { HistoryIcon } from "lucide-react";

import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/i18n/language-provider";
import { adminWalletApi } from "@/lib/api/services/admin-wallet";
import type { WalletHistoryItem } from "@/lib/api/types/admin-wallet";

import { CopyValueButton } from "./copy-value-button";

const pageLimit = 20;

function formatMinor(value: string, formatNumber: (amount: number) => string) {
  if (!/^-?\d+$/.test(value)) return value;
  const amount = Number(value);
  return Number.isSafeInteger(amount) ? formatNumber(amount) : value;
}

export function MerchantWalletHistory() {
  const { t, formatNumber, formatDateTime } = useI18n();

  //--------history----//
  const historyQuery = useInfiniteQuery({
    queryKey: ["admin-wallet", "merchant-history", pageLimit],
    queryFn: ({ pageParam, signal }) =>
      adminWalletApi.getMerchantWalletHistory({ limit: pageLimit, beforeJournalId: pageParam }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_before_journal_id ?? undefined,
  });
  //-------end-history----//

  const items = useMemo(() => historyQuery.data?.pages.flatMap((page) => page.items) ?? [], [historyQuery.data]);
  const currencyCode = historyQuery.data?.pages[0]?.currency_code;

  return (
    <Card className="gap-0 py-0">
      {/* //--------header----// */}
      <CardHeader className="border-b pt-(--card-spacing)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="size-4 text-muted-foreground" />
              {t("wallets.merchantHistory")}
              {items.length > 0 ? (
                <Badge variant="secondary" className="bg-primary/10 font-normal text-primary">
                  {t("wallets.historyCount", { count: formatNumber(items.length) })}
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription>{t("wallets.merchantHistoryDescription")}</CardDescription>
          </div>
          {currencyCode ? <Badge variant="outline">{currencyCode}</Badge> : null}
        </div>
      </CardHeader>
      {/* //-------end-header----// */}

      {/* //--------table----// */}
      <CardContent className="flex flex-col gap-4 p-4" aria-busy={historyQuery.isFetching}>
        {historyQuery.isPending ? <Skeleton className="h-48 w-full" /> : null}

        {!historyQuery.isPending && items.length === 0 && historyQuery.data ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HistoryIcon />
              </EmptyMedia>
              <EmptyTitle>{t("wallets.emptyHistory")}</EmptyTitle>
              <EmptyDescription>{t("wallets.emptyHistoryDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("wallets.createdAt")}</TableHead>
                <TableHead className="text-start">{t("wallets.journalId")}</TableHead>
                <TableHead className="text-start">{t("wallets.walletStatus")}</TableHead>
                <TableHead className="text-start">{t("wallets.bookChange")}</TableHead>
                <TableHead className="text-start">{t("wallets.transactionKind")}</TableHead>
                <TableHead className="text-start">{t("wallets.resource")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <HistoryRow
                  key={item.journal_id}
                  item={item}
                  formatAmount={(value) => formatMinor(value, formatNumber)}
                  formatDateTime={formatDateTime}
                />
              ))}
            </TableBody>
          </Table>
        ) : null}

        {historyQuery.hasNextPage ? (
          <div className="flex justify-center border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={historyQuery.isFetchingNextPage}
              onClick={() => void historyQuery.fetchNextPage()}
            >
              {historyQuery.isFetchingNextPage ? <Spinner data-icon="inline-start" /> : null}
              {t("wallets.loadMore")}
            </Button>
          </div>
        ) : null}

        {!historyQuery.isPending && !historyQuery.data ? (
          <AccessError
            error={historyQuery.error}
            retry={() => void historyQuery.refetch()}
            busy={historyQuery.isFetching}
          />
        ) : null}
      </CardContent>
      {/* //-------end-table----// */}
    </Card>
  );
}

function HistoryRow({
  item,
  formatAmount,
  formatDateTime,
}: {
  item: WalletHistoryItem;
  formatAmount: (value: string) => string;
  formatDateTime: (value: string) => string;
}) {
  const { t } = useI18n();
  const dash = t("wallets.notAssigned");
  const resourceLabel = [item.resource_type, item.action, item.withdrawal_status].filter(Boolean).join(" · ");

  return (
    <TableRow>
      <TableCell>
        <span className="text-muted-foreground text-sm" dir="ltr">
          {formatDateTime(item.created_at)}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <span className="max-w-36 truncate font-mono text-xs" dir="ltr">
            {item.journal_id}
          </span>
          <CopyValueButton value={item.journal_id} />
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-normal">
          {item.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-medium tabular-nums" dir="ltr">
          {formatAmount(item.book_change_minor)}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm">{item.transaction_kind ?? dash}</span>
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm">{resourceLabel || dash}</span>
          {item.resource_id || item.withdrawal_id ? (
            <span className="truncate font-mono text-muted-foreground text-xs" dir="ltr">
              {item.withdrawal_id ?? item.resource_id}
            </span>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
