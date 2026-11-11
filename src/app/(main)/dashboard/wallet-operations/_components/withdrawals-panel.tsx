"use client";

import { useState } from "react";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BanknoteIcon, FilterIcon } from "lucide-react";

import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { adminWalletOperationApi } from "@/lib/api/services/admin-wallet-operation";
import type { AdminWithdrawalDetail } from "@/lib/api/types/admin-wallet-operation";
import { notify } from "@/lib/notify";

import { DetailFields } from "./detail-fields";
import { OperationPagination } from "./operation-pagination";
import { OperationTable } from "./operation-table";
import { WithdrawalActionDialog } from "./withdrawal-action-dialog";

const pageSize = 10;

export function WithdrawalsPanel() {
  const { t, formatNumber, formatDateTime, inlineEnd } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusDraft, setStatusDraft] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionOpen, setActionOpen] = useState(false);

  //--------list----//
  const listQuery = useQuery({
    queryKey: ["admin-wallet-operations", "withdrawals", page, pageSize, status],
    queryFn: ({ signal }) =>
      adminWalletOperationApi.listWithdrawals({ page, size: pageSize, status: status || null }, signal),
    placeholderData: keepPreviousData,
  });
  //-------end-list----//

  //--------detail----//
  const detailQuery = useQuery({
    queryKey: ["admin-wallet-operations", "withdrawal", selectedId],
    queryFn: ({ signal }) => adminWalletOperationApi.getWithdrawal(selectedId ?? "", signal),
    enabled: Boolean(selectedId),
  });
  //-------end-detail----//

  //--------evidence----//
  const evidenceQuery = useMutation({
    mutationFn: (withdrawalId: string) => adminWalletOperationApi.getWithdrawalEvidence(withdrawalId),
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        return;
      }
      notify.error(t("wallet-operations.evidenceOpenFailed"));
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error));
    },
  });
  //-------end-evidence----//

  const pageInfo = listQuery.data;
  const total = pageInfo?.total ?? 0;

  function invalidateWithdrawals() {
    void queryClient.invalidateQueries({ queryKey: ["admin-wallet-operations", "withdrawals"] });
    if (selectedId) {
      void queryClient.invalidateQueries({ queryKey: ["admin-wallet-operations", "withdrawal", selectedId] });
    }
  }

  return (
    <>
      <Card className="gap-0 py-0">
        {/* //--------header----// */}
        <CardHeader className="border-b pt-(--card-spacing)">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2">
                {t("wallet-operations.withdrawals")}
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
                <FieldLabel htmlFor="withdrawal-status-filter">{t("wallet-operations.statusFilter")}</FieldLabel>
                <Input
                  id="withdrawal-status-filter"
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
                  secondary: item.user_name,
                }))}
                secondaryLabel={t("wallet-operations.customer")}
                emptyTitle={t("wallet-operations.emptyWithdrawals")}
                emptyDescription={t("wallet-operations.emptyWithdrawalsDescription")}
                emptyIcon={<BanknoteIcon />}
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
            <SheetTitle>{t("wallet-operations.withdrawalDetails")}</SheetTitle>
            <SheetDescription>{detailQuery.data?.user_name?.trim() || selectedId}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {detailQuery.isPending ? <Skeleton className="h-40 w-full" /> : null}
            {detailQuery.data ? (
              <WithdrawalDetails
                withdrawal={detailQuery.data}
                formatDateTime={formatDateTime}
                evidencePending={evidenceQuery.isPending}
                onOpenActions={() => setActionOpen(true)}
                onViewEvidence={() => {
                  if (selectedId) evidenceQuery.mutate(selectedId);
                }}
              />
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

      {selectedId ? (
        <WithdrawalActionDialog
          withdrawalId={selectedId}
          open={actionOpen}
          onOpenChange={setActionOpen}
          onCompleted={invalidateWithdrawals}
        />
      ) : null}
    </>
  );
}

function WithdrawalDetails({
  withdrawal,
  formatDateTime,
  evidencePending,
  onOpenActions,
  onViewEvidence,
}: {
  withdrawal: AdminWithdrawalDetail;
  formatDateTime: (value: string) => string;
  evidencePending: boolean;
  onOpenActions: () => void;
  onViewEvidence: () => void;
}) {
  const { t } = useI18n();
  const dash = t("wallet-operations.notAvailable");

  const overviewRows = [
    { label: t("wallet-operations.id"), value: withdrawal.id, dir: "ltr" as const },
    { label: t("wallet-operations.status"), value: withdrawal.status },
    {
      label: t("wallet-operations.pendingAction"),
      value: withdrawal.pending_action ?? dash,
    },
    {
      label: t("wallet-operations.amount"),
      value: `${withdrawal.amount_minor} ${withdrawal.currency_code}`,
      dir: "ltr" as const,
    },
    {
      label: t("wallet-operations.fee"),
      value: withdrawal.fee_minor ? `${withdrawal.fee_minor} ${withdrawal.currency_code}` : dash,
      dir: "ltr" as const,
    },
    {
      label: t("wallet-operations.totalDeduction"),
      value: withdrawal.total_deduction_minor
        ? `${withdrawal.total_deduction_minor} ${withdrawal.currency_code}`
        : dash,
      dir: "ltr" as const,
    },
    { label: t("wallet-operations.created"), value: formatDateTime(withdrawal.created_at), dir: "ltr" as const },
    {
      label: t("wallet-operations.expiresAt"),
      value: withdrawal.expires_at ? formatDateTime(withdrawal.expires_at) : dash,
      dir: "ltr" as const,
    },
    {
      label: t("wallet-operations.payoutReference"),
      value: withdrawal.payout_reference ?? dash,
      dir: "ltr" as const,
    },
    { label: t("wallet-operations.userId"), value: withdrawal.user_id, dir: "ltr" as const },
  ];

  const bank = withdrawal.bank_details;
  const bankRows = [
    { label: t("wallet-operations.bankName"), value: bank.bank_name },
    { label: t("wallet-operations.accountHolder"), value: bank.account_holder_name },
    { label: t("wallet-operations.accountNumber"), value: bank.account_number, dir: "ltr" as const },
    { label: t("wallet-operations.iban"), value: bank.iban_number, dir: "ltr" as const },
    { label: t("wallet-operations.accountType"), value: bank.account_type },
    { label: t("wallet-operations.bankBranch"), value: bank.bank_branch ?? dash },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary" className="w-fit font-normal">
        {withdrawal.status}
      </Badge>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onOpenActions}>
          {t("wallet-operations.actions")}
        </Button>
        <Button variant="outline" size="sm" disabled={evidencePending} onClick={onViewEvidence}>
          {evidencePending ? <Spinner data-icon="inline-start" /> : null}
          {t("wallet-operations.viewEvidence")}
        </Button>
      </div>
      <Separator />
      <DetailFields title={t("wallet-operations.fields")} rows={overviewRows} />
      <Separator />
      <DetailFields title={t("wallet-operations.bankDetails")} rows={bankRows} />
    </div>
  );
}
