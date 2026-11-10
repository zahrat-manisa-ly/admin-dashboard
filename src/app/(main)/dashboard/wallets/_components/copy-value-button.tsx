"use client";

import { useState } from "react";

import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/language-provider";
import { notify } from "@/lib/notify";

export function CopyValueButton({ value }: { value: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      notify.success(t("wallets.copied"));
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error(t("wallets.copyFailed"));
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="shrink-0"
      aria-label={t("wallets.copy")}
      onClick={() => void handleCopy()}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}
