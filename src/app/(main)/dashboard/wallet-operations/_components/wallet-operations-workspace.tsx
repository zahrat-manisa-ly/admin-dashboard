"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n/language-provider";

import { TransfersPanel } from "./transfers-panel";
import { WithdrawalsPanel } from "./withdrawals-panel";

export function WalletOperationsWorkspace() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-5">
      {/* //--------header----// */}
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">{t("wallet-operations.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("wallet-operations.summary")}</p>
      </div>
      {/* //-------end-header----// */}

      {/* //--------tabs----// */}
      <Tabs defaultValue="withdrawals">
        <TabsList variant="line">
          <TabsTrigger value="withdrawals">{t("wallet-operations.withdrawals")}</TabsTrigger>
          <TabsTrigger value="transfers">{t("wallet-operations.transfers")}</TabsTrigger>
        </TabsList>
        <TabsContent value="withdrawals" className="mt-4">
          <WithdrawalsPanel />
        </TabsContent>
        <TabsContent value="transfers" className="mt-4">
          <TransfersPanel />
        </TabsContent>
      </Tabs>
      {/* //-------end-tabs----// */}
    </div>
  );
}
