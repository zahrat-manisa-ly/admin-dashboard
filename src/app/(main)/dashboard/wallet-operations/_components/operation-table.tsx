"use client";

import type { ReactNode } from "react";

import { EyeIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/i18n/language-provider";

export interface OperationTableRow {
  id: string;
  status: string;
  amountMinor: string;
  currencyCode: string;
  createdAt: string;
  secondary?: string | null;
}

export function OperationTable({
  rows,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  secondaryLabel,
  onView,
}: {
  rows: OperationTableRow[];
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: ReactNode;
  secondaryLabel?: string;
  onView: (id: string) => void;
}) {
  const { t, formatDateTime } = useI18n();

  if (rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">{emptyIcon}</EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-start">{secondaryLabel ?? t("wallet-operations.id")}</TableHead>
          <TableHead className="text-start">{t("wallet-operations.status")}</TableHead>
          <TableHead className="text-start">{t("wallet-operations.amount")}</TableHead>
          <TableHead className="text-start">{t("wallet-operations.created")}</TableHead>
          <TableHead className="text-end" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="flex min-w-0 flex-col gap-0.5">
                {row.secondary ? <span className="truncate font-medium">{row.secondary}</span> : null}
                <span className="max-w-48 truncate font-mono text-muted-foreground text-xs" dir="ltr">
                  {row.id}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-normal">
                {row.status}
              </Badge>
            </TableCell>
            <TableCell>
              <span dir="ltr">
                {row.amountMinor} {row.currencyCode}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-muted-foreground text-sm" dir="ltr">
                {formatDateTime(row.createdAt)}
              </span>
            </TableCell>
            <TableCell className="text-end">
              <Button variant="outline" size="sm" onClick={() => onView(row.id)}>
                <EyeIcon data-icon="inline-start" />
                {t("wallet-operations.view")}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
