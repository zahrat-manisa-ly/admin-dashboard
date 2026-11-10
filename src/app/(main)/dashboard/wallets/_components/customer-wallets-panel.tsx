"use client";

import { useState } from "react";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, PlusIcon, SnowflakeIcon, UserIcon, WalletIcon } from "lucide-react";

import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/language-provider";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { adminWalletApi } from "@/lib/api/services/admin-wallet";
import type { CustomerWallet, CustomerWalletMapping } from "@/lib/api/types/admin-wallet";
import { notify } from "@/lib/notify";
import { getInitials } from "@/lib/utils";

import { CopyValueButton } from "./copy-value-button";

const userIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CustomerWalletsPanel() {
  const { t, formatNumber, inlineEnd } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [freezeTarget, setFreezeTarget] = useState<CustomerWalletMapping | null>(null);
  const [freezeReason, setFreezeReason] = useState("");
  const [freezeReasonError, setFreezeReasonError] = useState("");
  const pageSize = 10;

  //--------list----//
  const walletsQuery = useQuery({
    queryKey: ["admin-wallet", "customers", page, pageSize],
    queryFn: ({ signal }) => adminWalletApi.listCustomerWallets({ page, size: pageSize }, signal),
    placeholderData: keepPreviousData,
  });
  //-------end-list----//

  //--------detail----//
  const detailQuery = useQuery({
    queryKey: ["admin-wallet", "customer", selectedUserId],
    queryFn: ({ signal }) => adminWalletApi.getCustomerWallet(selectedUserId ?? "", signal),
    enabled: Boolean(selectedUserId),
  });
  //-------end-detail----//

  //--------create----//
  const createWallet = useMutation({
    mutationFn: (id: string) => adminWalletApi.createCustomerWallet(id, { currency_code: "LYD" }),
    onSuccess: async () => {
      notify.success(t("wallets.created"));
      setCreateOpen(false);
      setUserId("");
      setUserIdError("");
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ["admin-wallet", "customers"] });
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error));
    },
  });
  //-------end-create----//

  //--------freeze----//
  const freezeWallet = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminWalletApi.freezeCustomerWallet(id, { frozen: true, reason }),
    onSuccess: async () => {
      notify.success(t("wallets.frozenSuccess"));
      setFreezeTarget(null);
      setFreezeReason("");
      setFreezeReasonError("");
      await queryClient.invalidateQueries({ queryKey: ["admin-wallet", "customers"] });
    },
    onError: (error) => {
      notify.error(getApiErrorMessage(error));
    },
  });
  //-------end-freeze----//

  function submitWallet() {
    const nextId = userId.trim();
    if (!userIdPattern.test(nextId)) {
      setUserIdError(t("wallets.userIdInvalid"));
      return;
    }
    setUserIdError("");
    createWallet.mutate(nextId);
  }

  function submitFreeze() {
    if (!freezeTarget) return;
    const reason = freezeReason.trim();
    if (!reason) {
      setFreezeReasonError(t("wallets.freezeReasonRequired"));
      return;
    }
    setFreezeReasonError("");
    freezeWallet.mutate({ id: freezeTarget.user_id, reason });
  }

  const pageInfo = walletsQuery.data;
  const total = pageInfo?.total ?? 0;

  return (
    <Card className="gap-0 py-0">
      {/* //--------header----// */}
      <CardHeader className="border-b pt-(--card-spacing)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              {t("wallets.customerWallets")}
              {total > 0 ? (
                <Badge variant="secondary" className="bg-primary/10 font-normal text-primary">
                  {t("wallets.totalCount", { count: formatNumber(total) })}
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription>{t("wallets.customerWalletsDescription")}</CardDescription>
          </div>
          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (!open) setUserIdError("");
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon data-icon="inline-start" />
                {t("wallets.createWallet")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("wallets.createWallet")}</DialogTitle>
                <DialogDescription>{t("wallets.createWalletDescription")}</DialogDescription>
              </DialogHeader>
              <Field data-invalid={userIdError ? true : undefined}>
                <FieldLabel htmlFor="customer-wallet-user-id">{t("wallets.userId")}</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <UserIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="customer-wallet-user-id"
                    value={userId}
                    dir="ltr"
                    autoComplete="off"
                    aria-invalid={userIdError ? true : undefined}
                    disabled={createWallet.isPending}
                    placeholder="00000000-0000-0000-0000-000000000000"
                    onChange={(event) => setUserId(event.target.value)}
                  />
                </InputGroup>
                <FieldDescription>{t("wallets.currencyFixed")}</FieldDescription>
                {userIdError ? <FieldError>{userIdError}</FieldError> : null}
              </Field>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={createWallet.isPending}>
                    {t("wallets.cancel")}
                  </Button>
                </DialogClose>
                <Button type="button" disabled={createWallet.isPending} onClick={submitWallet}>
                  {createWallet.isPending ? <Spinner data-icon="inline-start" /> : null}
                  {t("wallets.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      {/* //-------end-header----// */}

      {/* //--------table----// */}
      <CardContent className="flex flex-col gap-4 p-4" aria-busy={walletsQuery.isFetching}>
        {walletsQuery.isPending ? <Skeleton className="h-48 w-full" /> : null}
        {pageInfo && pageInfo.items.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>{t("wallets.emptyCustomers")}</EmptyTitle>
              <EmptyDescription>{t("wallets.emptyCustomersDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {pageInfo && pageInfo.items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t("wallets.customer")}</TableHead>
                <TableHead className="text-start">{t("wallets.walletId")}</TableHead>
                <TableHead className="text-start">{t("wallets.kyc")}</TableHead>
                <TableHead className="text-end" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageInfo.items.map((item) => {
                const displayName = item.user_name?.trim() || t("wallets.notAssigned");
                return (
                  <TableRow key={item.wallet_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback className="text-[10px]">{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">{displayName}</span>
                          <span className="truncate font-mono text-muted-foreground text-xs" dir="ltr">
                            {item.user_id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="max-w-40 truncate font-mono text-xs" dir="ltr">
                          {item.wallet_id}
                        </span>
                        <CopyValueButton value={item.wallet_id} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.kyc_verified ? "secondary" : "outline"}
                        className={item.kyc_verified ? "bg-primary/10 font-normal text-primary" : "font-normal"}
                      >
                        {item.kyc_verified ? t("wallets.verified") : t("wallets.notVerified")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={freezeWallet.isPending && freezeWallet.variables?.id === item.user_id}
                          onClick={() => {
                            setFreezeTarget(item);
                            setFreezeReason("");
                            setFreezeReasonError("");
                          }}
                        >
                          <SnowflakeIcon data-icon="inline-start" />
                          {t("wallets.freeze")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUserId(item.user_id)}>
                          <EyeIcon data-icon="inline-start" />
                          {t("wallets.view")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : null}
        {pageInfo && pageInfo.pages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <p className="text-muted-foreground text-sm">
              {t("wallets.pageOf", { page: formatNumber(pageInfo.page), pages: formatNumber(pageInfo.pages) })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageInfo.page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                {t("wallets.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pageInfo.page >= pageInfo.pages}
                onClick={() => setPage((current) => current + 1)}
              >
                {t("wallets.next")}
              </Button>
            </div>
          </div>
        ) : null}
        {!walletsQuery.isPending && !walletsQuery.data ? (
          <AccessError
            error={walletsQuery.error}
            retry={() => void walletsQuery.refetch()}
            busy={walletsQuery.isFetching}
          />
        ) : null}
      </CardContent>
      {/* //-------end-table----// */}

      {/* //--------detail-sheet----// */}
      <Sheet open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <SheetContent side={inlineEnd}>
          <SheetHeader>
            <SheetTitle>{t("wallets.customerWallet")}</SheetTitle>
            <SheetDescription>{detailQuery.data?.user_name ?? t("wallets.customer")}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            {detailQuery.isPending ? <Skeleton className="h-40 w-full" /> : null}
            {detailQuery.data ? <CustomerWalletDetails wallet={detailQuery.data} /> : null}
            {!detailQuery.isPending && !detailQuery.data && selectedUserId ? (
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

      {/* //--------freeze-dialog----// */}
      <Dialog
        open={Boolean(freezeTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setFreezeTarget(null);
            setFreezeReason("");
            setFreezeReasonError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("wallets.freezeWallet")}</DialogTitle>
            <DialogDescription>{t("wallets.freezeWalletDescription")}</DialogDescription>
          </DialogHeader>
          {freezeTarget ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="font-medium">{freezeTarget.user_name?.trim() || t("wallets.notAssigned")}</p>
                <p className="font-mono text-muted-foreground text-xs" dir="ltr">
                  {freezeTarget.user_id}
                </p>
              </div>
              <Field data-invalid={freezeReasonError ? true : undefined}>
                <FieldLabel htmlFor="customer-wallet-freeze-reason">{t("wallets.freezeReason")}</FieldLabel>
                <Textarea
                  id="customer-wallet-freeze-reason"
                  value={freezeReason}
                  maxLength={500}
                  disabled={freezeWallet.isPending}
                  aria-invalid={freezeReasonError ? true : undefined}
                  placeholder={t("wallets.freezeReasonPlaceholder")}
                  onChange={(event) => setFreezeReason(event.target.value)}
                />
                {freezeReasonError ? <FieldError>{freezeReasonError}</FieldError> : null}
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={freezeWallet.isPending}>
                {t("wallets.cancel")}
              </Button>
            </DialogClose>
            <Button type="button" disabled={freezeWallet.isPending} onClick={submitFreeze}>
              {freezeWallet.isPending ? <Spinner data-icon="inline-start" /> : null}
              {t("wallets.freezeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* //-------end-freeze-dialog----// */}
    </Card>
  );
}

function CustomerWalletDetails({ wallet }: { wallet: CustomerWallet }) {
  const { t } = useI18n();
  const displayName = wallet.user_name?.trim() || t("wallets.notAssigned");
  const profileRows = [
    { label: t("wallets.name"), value: displayName },
    {
      label: t("wallets.walletType"),
      value: wallet.wallet_type === "merchant" ? t("wallets.kindMerchant") : t("wallets.kindCustomer"),
    },
    { label: t("wallets.currency"), value: wallet.currency_code, dir: "ltr" as const },
    { label: t("wallets.walletCode"), value: wallet.wallet_code ?? t("wallets.notAssigned"), dir: "ltr" as const },
  ];
  const idRows = [
    { label: t("wallets.walletId"), value: wallet.wallet_id },
    { label: t("wallets.ownerId"), value: wallet.owner_id },
    { label: t("wallets.userId"), value: wallet.user_id },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-medium">{displayName}</p>
          <p className="text-muted-foreground text-sm">{t("wallets.customerWallet")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {profileRows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">{row.label}</p>
            <p className="break-all font-medium" dir={row.dir}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <p className="font-medium text-sm">{t("wallets.identifiers")}</p>
        {idRows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <p className="text-muted-foreground text-sm">{row.label}</p>
            <div className="flex items-center gap-1">
              <p className="min-w-0 flex-1 break-all font-mono text-sm" dir="ltr">
                {row.value}
              </p>
              <CopyValueButton value={row.value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
