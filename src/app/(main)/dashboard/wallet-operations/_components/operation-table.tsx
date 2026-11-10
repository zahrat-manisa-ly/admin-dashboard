"use client";

import type { ReactNode } from "react";

import { EyeIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/i18n/language-provider";

import { type OperationPage, pickString, recordId } from "./operation-record";

export function OperationTable({
  page,
  idKeys,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onView,
}: {
  page: OperationPage;
  idKeys: string[];
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: ReactNode;
  onView: (id: string) => void;
}) {
  const { t } = useI18n();

  if (page.items.length === 0) {
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
          <TableHead className="text-start">{t("wallet-operations.id")}</TableHead>
          <TableHead className="text-start">{t("wallet-operations.status")}</TableHead>
          <TableHead className="text-start">{t("wallet-operations.amount")}</TableHead>
          <TableHead className="text-start">{t("wallet-operations.created")}</TableHead>
          <TableHead className="text-end" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {page.items.map((item, index) => {
          const id = recordId(item, idKeys) ?? `row-${index}`;
          const status = pickString(item, ["status", "state"]);
          const amount = pickString(item, ["amount_minor", "amount", "available_balance_minor"]);
          const created = pickString(item, ["created_at", "created", "requested_at", "updated_at"]);
          const canView = Boolean(recordId(item, idKeys));

          return (
            <TableRow key={id}>
              <TableCell>
                <span className="max-w-48 truncate font-mono text-xs" dir="ltr">
                  {id}
                </span>
              </TableCell>
              <TableCell>
                {status ? (
                  <Badge variant="secondary" className="font-normal">
                    {status}
                  </Badge>
                ) : (
                  t("wallet-operations.notAvailable")
                )}
              </TableCell>
              <TableCell>
                <span dir="ltr">{amount ?? t("wallet-operations.notAvailable")}</span>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm" dir="ltr">
                  {created ?? t("wallet-operations.notAvailable")}
                </span>
              </TableCell>
              <TableCell className="text-end">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canView}
                  onClick={() => {
                    const nextId = recordId(item, idKeys);
                    if (nextId) onView(nextId);
                  }}
                >
                  <EyeIcon data-icon="inline-start" />
                  {t("wallet-operations.view")}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
