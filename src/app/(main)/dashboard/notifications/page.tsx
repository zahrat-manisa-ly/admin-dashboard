import { Suspense } from "react";

import type { Metadata } from "next";

import { AccessSkeleton } from "../_components/access/access-skeleton";
import { NotificationsWorkspace } from "./_components/notifications-workspace";

export const metadata: Metadata = {
  title: "Notifications | Manisa Travel Admin",
  description: "Review alerts for bookings, payments, and team activity.",
  alternates: {
    canonical: "/dashboard/notifications",
  },
};

export default function Page() {
  return (
    <Suspense fallback={<AccessSkeleton />}>
      <NotificationsWorkspace />
    </Suspense>
  );
}
