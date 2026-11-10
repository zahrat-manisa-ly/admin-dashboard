"use client";

import { useI18n } from "@/i18n/language-provider";

import { type OperationRecord, recordEntries } from "./operation-record";

export function RecordDetails({ record }: { record: OperationRecord }) {
  const { t } = useI18n();
  const entries = recordEntries(record);

  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("wallet-operations.notAvailable")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-sm">{t("wallet-operations.fields")}</p>
      {entries.map((entry) => (
        <div key={entry.key} className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">{entry.key}</p>
          <p className="break-all font-mono text-sm" dir="ltr">
            {entry.value}
          </p>
        </div>
      ))}
    </div>
  );
}
