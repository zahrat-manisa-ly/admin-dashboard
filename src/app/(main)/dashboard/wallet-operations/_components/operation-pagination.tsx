"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/language-provider";
import type { Page } from "@/lib/api/types/users";

export function OperationPagination({
  page,
  onPageChange,
}: {
  page: Pick<Page<unknown>, "page" | "pages">;
  onPageChange: (page: number) => void;
}) {
  const { t, formatNumber } = useI18n();

  if (page.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t pt-4">
      <p className="text-muted-foreground text-sm">
        {t("wallet-operations.pageOf", {
          page: formatNumber(page.page),
          pages: formatNumber(page.pages),
        })}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page.page <= 1} onClick={() => onPageChange(page.page - 1)}>
          {t("wallet-operations.previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page.page >= page.pages}
          onClick={() => onPageChange(page.page + 1)}
        >
          {t("wallet-operations.next")}
        </Button>
      </div>
    </div>
  );
}
