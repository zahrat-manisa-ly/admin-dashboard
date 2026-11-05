"use client";

import { Fragment } from "react";

import { CalendarPlus, UserCheck, UserRound, UserX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CustomerListKpis } from "@/lib/api/types/users";

type CustomersKpisProps = {
  kpis: CustomerListKpis | null | undefined;
  formatNumber: (value: number) => string;
  ar: boolean;
};

const cards = [
  { key: "total_customers" as const, icon: UserRound },
  { key: "active_customers" as const, icon: UserCheck },
  { key: "blocked_customers" as const, icon: UserX },
  { key: "new_this_month" as const, icon: CalendarPlus },
];

function kpiCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function CustomersKpis({ kpis, formatNumber, ar }: CustomersKpisProps) {
  //--------kpis----//
  const values = {
    total_customers: kpiCount(kpis?.total_customers),
    active_customers: kpiCount(kpis?.active_customers),
    blocked_customers: kpiCount(kpis?.blocked_customers),
    new_this_month: kpiCount(kpis?.new_this_month),
  };
  const labels: Record<(typeof cards)[number]["key"], { en: string; ar: string }> = {
    total_customers: { en: "Total customers", ar: "إجمالي العملاء" },
    active_customers: { en: "Active", ar: "النشطون" },
    blocked_customers: { en: "Blocked", ar: "الموقوفون" },
    new_this_month: { en: "Joined this month", ar: "انضموا هذا الشهر" },
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
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <h4 className="font-semibold text-2xl tabular-nums leading-none tracking-tight">
                    {formatNumber(values[card.key])}
                  </h4>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </div>
                <Icon className="size-5 shrink-0 text-muted-foreground/45" aria-hidden="true" />
              </div>
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
  //-------end-kpis----//
}
