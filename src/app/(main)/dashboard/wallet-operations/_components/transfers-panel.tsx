"use client";

import { useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeftRightIcon, FilterIcon } from "lucide-react";

import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/language-provider";
import { adminWalletOperationApi } from "@/lib/api/services/admin-wallet-operation";
import type { TransferResponse } from "@/lib/api/types/admin-wallet-operation";

import { DetailFields } from "./detail-fields";
import { OperationPagination } from "./operation-pagination";
import { OperationTable } from "./operation-table";

const pageSize = 10;

export function TransfersPanel() {
  const { t, formatNumber, formatDateTime, inlineEnd } = useI18n();
  const [page, setPage] = useState(1);
  const [statusDraft, setStatusDraft] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  //--------list----//
  const listQuery = useQuery({
    queryKey: ["admin-wallet-operations", "transfers", page, pageSize, status],
    queryFn: ({ signal }) =>
      adminWalletOperationApi.listTransfers({ page, size: pageSize, status: status || null }, signal),
    placeholderData: keepPreviousData,
  });
  //-------end-list----//

  //--------detail----//
  const detailQuery = useQuery({
    queryKey: ["admin-wallet-operations", "transfer", selectedId],
    queryFn: ({ signal }) => adminWalletOperationApi.getTransfer(selectedId ?? "", signal),
    enabled: Boolean(selectedId),
  });
  //-------end-detail----//

  const pageInfo = listQuery.data;
  const total = pageInfo?.total ?? 0;

  return (
    <>
      <Card className="gap-0 py-0">
        {/* //--------header----// */}
        <CardHeader className="border-b pt-(--card-spacing)">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2">
                {t("wallet-operations.transfers")}
                {total > 0 ? (
                  <Badge variant="secondary" className="bg-primary/10 font-normal text-primary">
                    {t("wallet-operations.totalCount", { count: formatNumber(total) })}
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>{t("wallet-operations.summary")}</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end lg:w-auto">
              <Field className="min-w-0 flex-1 gap-1.5 lg:w-56">
                <FieldLabel htmlFor="transfer-status-filter">{t("wallet-operations.statusFilter")}</FieldLabel>
                <Input
                  id="transfer-status-filter"
                  value={statusDraft}
                  placeholder={t("wallet-operations.statusPlaceholder")}
                  onChange={(event) => setStatusDraft(event.target.value)}
                />
              </Field>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage(1);
                    setStatus(statusDraft.trim());
                  }}
                >
                  <FilterIcon data-icon="inline-start" />
                  {t("wallet-operations.applyFilter")}
                </Button>
                {status ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusDraft("");
                      setStatus("");
                      setPage(1);
                    }}
                  >
                    {t("wallet-operations.clearFilter")}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>
        {/* //-------end-header----// */}

        {/* //--------table----// */}
        <CardContent className="flex flex-col gap-4 p-4" aria-busy={listQuery.isFetching}>
          {listQuery.isPending ? <Skeleton className="h-48 w-full" /> : null}
          {pageInfo ? (
            <>
              <OperationTable
                rows={pageInfo.items.map((item) => ({
                  id: item.id,
                  status: item.status,
                  amountMinor: item.amount_minor,
                  currencyCode: item.currency_code,
                  createdAt: item.created_at,
                  secondary:
                    item.sender_name || item.recipient_name
                      ? `${item.sender_name ?? t("wallet-operations.notAvailable")} → ${item.recipient_name ?? t("wallet-operations.notAvailable")}`
                      : null,
                }))}
                secondaryLabel={t("wallet-operations.parties")}
                emptyTitle={t("wallet-operations.emptyTransfers")}
                emptyDescription={t("wallet-operations.emptyTransfersDescription")}
                emptyIcon={<ArrowLeftRightIcon />}
                onView={setSelectedId}
              />
              <OperationPagination page={pageInfo} onPageChange={setPage} />
            </>
          ) : null}
          {!listQuery.isPending && !listQuery.data ? (
            <AccessError error={listQuery.error} retry={() => void listQuery.refetch()} busy={listQuery.isFetching} />
          ) : null}
        </CardContent>
        {/* //-------end-table----// */}
      </Card>

      {/* //--------detail-sheet----// */}
      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side={inlineEnd} className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("wallet-operations.transferDetails")}</SheetTitle>
            <SheetDescription className="font-mono" dir="ltr">
              {selectedId}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {detailQuery.isPending ? <Skeleton className="h-40 w-full" /> : null}
            {detailQuery.data ? <TransferDetails transfer={detailQuery.data} formatDateTime={formatDateTime} /> : null}
            {!detailQuery.isPending && !detailQuery.data && selectedId ? (
              <AccessError
                error={detailQuery.error}
                retry={() => void detailQuery.refetch()}
                busy={detailQuery.isFetching}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      {/* //-------end-detail-sheet----// */}
    </>
  );
}

function TransferDetails({
  transfer,
  formatDateTime,
}: {
  transfer: TransferResponse;
  formatDateTime: (value: string) => string;
}) {
  const { t } = useI18n();
  const dash = t("wallet-operations.notAvailable");

  const rows = [
    { label: t("wallet-operations.id"), value: transfer.id, dir: "ltr" as const },
    { label: t("wallet-operations.status"), value: transfer.status },
    { label: t("wallet-operations.pendingAction"), value: transfer.pending_action ?? dash },
    {
      label: t("wallet-operations.amount"),
      value: `${transfer.amount_minor} ${transfer.currency_code}`,
      dir: "ltr" as const,
    },
    {
      label: t("wallet-operations.fee"),
      value: transfer.fee_minor ? `${transfer.fee_minor} ${transfer.currency_code}` : dash,
      dir: "ltr" as const,
    },
    {
      label: t("wallet-operations.totalDeduction"),
      value: transfer.total_deduction_minor ? `${transfer.total_deduction_minor} ${transfer.currency_code}` : dash,
      dir: "ltr" as const,
    },
    { label: t("wallet-operations.sender"), value: transfer.sender_name ?? dash },
    { label: t("wallet-operations.recipient"), value: transfer.recipient_name ?? dash },
    { label: t("wallet-operations.created"), value: formatDateTime(transfer.created_at), dir: "ltr" as const },
    {
      label: t("wallet-operations.expiresAt"),
      value: transfer.expires_at ? formatDateTime(transfer.expires_at) : dash,
      dir: "ltr" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit font-normal">
        {transfer.status}
      </Badge>
      <DetailFields title={t("wallet-operations.fields")} rows={rows} />
    </div>
  );
}
