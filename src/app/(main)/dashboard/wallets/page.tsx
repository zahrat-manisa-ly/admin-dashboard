import type { Metadata } from "next";

import { WalletsWorkspace } from "./_components/wallets-workspace";

export const metadata: Metadata = {
  title: "Wallets | Manisa Travel Admin",
  description: "Merchant wallet balance, settlement links, and customer wallets.",
  alternates: {
    canonical: "/dashboard/wallets",
  },
};

export default function Page() {
  return <WalletsWorkspace />;
}
