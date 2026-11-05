"use client";

import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/language-provider";

//--------server-unreachable----//
export function ServerUnreachable({ retry, busy = false }: { retry?: () => void; busy?: boolean }) {
  const { t } = useI18n();

  return (
    <Empty className="min-h-72 border bg-card" role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WifiOff />
        </EmptyMedia>
        <EmptyTitle>{t("common.serverUnreachableTitle")}</EmptyTitle>
        <EmptyDescription>{t("common.serverUnreachableDetail")}</EmptyDescription>
      </EmptyHeader>
      {retry ? (
        <EmptyContent>
          <Button variant="outline" onClick={retry} disabled={busy}>
            {busy ? <Spinner data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
            {t("common.tryAgain")}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
//-------end-server-unreachable----//
