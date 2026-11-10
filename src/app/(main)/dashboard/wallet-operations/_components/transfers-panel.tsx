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

import { OperationPagination } from "./operation-pagination";
import { parseOperationPage, parseOperationRecord, pickString } from "./operation-record";
import { OperationTable } from "./operation-table";
import { RecordDetails } from "./record-details";

const pageSize = 10;
const transferIdKeys = ["transfer_id", "id"];

export function TransfersPanel() {
  const { t, formatNumber, inlineEnd } = useI18n();
  const [page, setPage] = useState(1);
  const [statusDraft, setStatusDraft] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  //--------list----//
  const listQuery = useQuery({
    queryKey: ["admin-wallet-operations", "transfers", page, pageSize, status],
    queryFn: async ({ signal }) => {
      const data = await adminWalletOperationApi.listTransfers(
        { page, size: pageSize, status: status || null },
        signal,
      );
      return parseOperationPage(data, page, pageSize);
    },
    placeholderData: keepPreviousData,
  });
  //-------end-list----//

  //--------detail----//
  const detailQuery = useQuery({
    queryKey: ["admin-wallet-operations", "transfer", selectedId],
    queryFn: async ({ signal }) => {
      const data = await adminWalletOperationApi.getTransfer(selectedId ?? "", signal);
      return parseOperationRecord(data);
    },
    enabled: Boolean(selectedId),
  });
  //-------end-detail----//

  const pageInfo = listQuery.data;
  const total = pageInfo?.total ?? 0;
  const detailStatus = detailQuery.data ? pickString(detailQuery.data, ["status", "state"]) : null;

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
                page={pageInfo}
                idKeys={transferIdKeys}
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
            {detailQuery.data ? (
              <>
                {detailStatus ? (
                  <Badge variant="secondary" className="w-fit font-normal">
                    {detailStatus}
                  </Badge>
                ) : null}
                <RecordDetails record={detailQuery.data} />
              </>
            ) : null}
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
