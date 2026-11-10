"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BanknoteIcon,
  BookMarkedIcon,
  CheckIcon,
  CircleDollarSignIcon,
  Link2Icon,
  LockIcon,
  type LucideIcon,
  TriangleAlertIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";

import { AccessError } from "@/app/(main)/dashboard/_components/access/access-feedback";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/language-provider";
import { adminWalletApi } from "@/lib/api/services/admin-wallet";
import type { MerchantWalletSummary, WalletConfiguration, WalletKind } from "@/lib/api/types/admin-wallet";
import { cn } from "@/lib/utils";

import { CopyValueButton } from "./copy-value-button";

function formatMinor(value: string, formatNumber: (amount: number) => string) {
  if (!/^-?\d+$/.test(value)) return value;
  const amount = Number(value);
  return Number.isSafeInteger(amount) ? formatNumber(amount) : value;
}

export function MerchantOverview() {
  const { t, formatNumber } = useI18n();
  const merchantQuery = useQuery({
    queryKey: ["admin-wallet", "merchant"],
    queryFn: ({ signal }) => adminWalletApi.getMerchantWallet(signal),
  });
  const configurationQuery = useQuery({
    queryKey: ["admin-wallet", "configuration"],
    queryFn: ({ signal }) => adminWalletApi.getConfiguration(signal),
  });

  if (merchantQuery.isPending || configurationQuery.isPending) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (!merchantQuery.data) {
    return (
      <AccessError
        error={merchantQuery.error}
        retry={() => void merchantQuery.refetch()}
        busy={merchantQuery.isFetching}
      />
    );
  }

  if (!configurationQuery.data) {
    return (
      <AccessError
        error={configurationQuery.error}
        retry={() => void configurationQuery.refetch()}
        busy={configurationQuery.isFetching}
      />
    );
  }

  return (
    <MerchantOverviewCard
      wallet={merchantQuery.data}
      configuration={configurationQuery.data}
      formatAmount={(value) => formatMinor(value, formatNumber)}
      t={t}
    />
  );
}

function MerchantOverviewCard({
  wallet,
  configuration,
  formatAmount,
  t,
}: {
  wallet: MerchantWalletSummary;
  configuration: WalletConfiguration;
  formatAmount: (value: string) => string;
  t: (id: string) => string;
}) {
  const kind: Record<WalletKind, string> = {
    customer: t("wallets.kindCustomer"),
    merchant: t("wallets.kindMerchant"),
  };
  const linkRows: { label: string; value: string | null; icon: LucideIcon }[] = [
    { label: t("wallets.merchantWalletId"), value: configuration.merchant_wallet_id, icon: WalletIcon },
    { label: t("wallets.tlyncSource"), value: configuration.tlync_settlement_source_id, icon: Link2Icon },
    { label: t("wallets.cashSource"), value: configuration.cash_settlement_source_id, icon: BanknoteIcon },
  ];
  const hasUnlinked = linkRows.some((row) => !row.value);
  const secondaryBalances = [
    {
      label: t("wallets.bookBalance"),
      value: formatAmount(wallet.book_balance_minor),
      icon: BookMarkedIcon,
    },
    {
      label: t("wallets.reserved"),
      value: formatAmount(wallet.reserved_minor),
      icon: LockIcon,
    },
  ];

  return (
    <Card className="gap-0 py-0">
      {/* //--------header----// */}
      <CardHeader className="border-b pt-(--card-spacing)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="size-4 text-muted-foreground" />
              {t("wallets.merchantWallet")}
            </CardTitle>
            <CardDescription>{t("wallets.merchantOverviewDescription")}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{wallet.currency_code}</Badge>
            <Badge variant="outline">{kind[wallet.wallet_type]}</Badge>
          </div>
        </div>
      </CardHeader>
      {/* //-------end-header----// */}

      <CardContent className="grid gap-0 p-0 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
        {/* //--------balances----// */}
        <div className="flex flex-col gap-5 border-b p-4 lg:border-e lg:border-b-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CircleDollarSignIcon className="size-4" />
              {t("wallets.availableBalance")}
            </div>
            <p className="font-semibold text-4xl tabular-nums tracking-tight" dir="ltr">
              {formatAmount(wallet.available_balance_minor)}
            </p>
            <p className="text-muted-foreground text-xs">{t("wallets.minorUnits")}</p>
            <div className="flex items-center gap-1 pt-1">
              <p className="min-w-0 flex-1 truncate font-mono text-muted-foreground text-sm" dir="ltr">
                {wallet.wallet_code ?? t("wallets.notAssigned")}
              </p>
              {wallet.wallet_code ? <CopyValueButton value={wallet.wallet_code} /> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {secondaryBalances.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Icon className="size-3.5" />
                    {item.label}
                  </div>
                  <p className="font-semibold text-lg tabular-nums tracking-tight" dir="ltr">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        {/* //-------end-balances----// */}

        {/* //--------links----// */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 font-medium text-sm">
              <Link2Icon className="size-4 text-muted-foreground" />
              {t("wallets.configuration")}
            </p>
            <p className="text-muted-foreground text-sm">{t("wallets.configurationDescription")}</p>
          </div>

          {hasUnlinked ? (
            <Alert>
              <TriangleAlertIcon />
              <AlertTitle>{t("wallets.linksIncompleteTitle")}</AlertTitle>
              <AlertDescription>{t("wallets.linksIncompleteDescription")}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col">
            {linkRows.map((row, index) => {
              const Icon = row.icon;
              const linked = Boolean(row.value);

              return (
                <div key={row.label}>
                  {index > 0 ? <Separator className="my-3" /> : null}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-lg",
                        linked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-muted-foreground text-sm">{row.label}</p>
                        <Badge
                          variant={linked ? "secondary" : "outline"}
                          className={cn("font-normal", linked && "bg-primary/10 text-primary")}
                        >
                          {linked ? <CheckIcon data-icon="inline-start" /> : <XIcon data-icon="inline-start" />}
                          {linked ? t("wallets.linked") : t("wallets.unlinked")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <p
                          className="min-w-0 flex-1 truncate font-mono text-sm"
                          dir="ltr"
                          title={row.value ?? undefined}
                        >
                          {row.value ?? t("wallets.notAssigned")}
                        </p>
                        {row.value ? <CopyValueButton value={row.value} /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* //-------end-links----// */}
      </CardContent>
    </Card>
  );
}
