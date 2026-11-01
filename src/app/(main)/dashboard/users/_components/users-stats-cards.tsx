"use client";

import { Fragment } from "react";

import { Clock3, UserCheck, UserRound, UserX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type UsersStatsCardsProps = {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  formatNumber: (value: number) => string;
  ar: boolean;
  pendingActive?: boolean;
  onPending?: () => void;
};

const cards = [
  { key: "total" as const, icon: UserRound },
  { key: "active" as const, icon: UserCheck },
  { key: "pending" as const, icon: Clock3 },
  { key: "suspended" as const, icon: UserX },
];

export function UsersStatsCards({
  total,
  active,
  pending,
  suspended,
  formatNumber,
  ar,
  pendingActive = false,
  onPending,
}: UsersStatsCardsProps) {
  const values = { total, active, pending, suspended };
  const labels: Record<(typeof cards)[number]["key"], { en: string; ar: string }> = {
    total: { en: "Total Members", ar: "إجمالي الأعضاء" },
    active: { en: "Active", ar: "نشط" },
    pending: { en: "Pending Invites", ar: "دعوات معلّقة" },
    suspended: { en: "Suspended", ar: "موقوف" },
  };

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardContent className="flex flex-col p-0 sm:flex-row sm:items-stretch">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const label = labels[card.key][ar ? "ar" : "en"];

          return (
            <Fragment key={card.key}>
              {index > 0 ? (
                <>
                  <Separator className="sm:hidden" />
                  <Separator orientation="vertical" className="hidden h-auto sm:block" />
                </>
              ) : null}
              {card.key === "pending" && onPending ? (
                <button
                  type="button"
                  onClick={onPending}
                  aria-pressed={pendingActive}
                  className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-4 text-start hover:bg-muted/60 sm:px-6 sm:py-5"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <h4 className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                      {formatNumber(values[card.key])}
                    </h4>
                    <p className="text-muted-foreground text-xs">{label}</p>
                  </div>
                  <Icon className="size-5 shrink-0 text-muted-foreground/45" aria-hidden="true" />
                </button>
              ) : (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h4 className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                      {formatNumber(values[card.key])}
                    </h4>
                    <p className="text-muted-foreground text-xs">{label}</p>
                  </div>
                  <Icon className="size-5 shrink-0 text-muted-foreground/45" aria-hidden="true" />
                </div>
              )}
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
}
