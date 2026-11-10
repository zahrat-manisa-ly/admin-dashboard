import type { Metadata } from "next";

import { WalletOperationsWorkspace } from "./_components/wallet-operations-workspace";

export const metadata: Metadata = {
  title: "Wallet operations | Manisa Travel Admin",
  description: "Review withdrawals and transfers, then take settlement actions.",
  alternates: {
    canonical: "/dashboard/wallet-operations",
  },
};

export default function Page() {
  return <WalletOperationsWorkspace />;
}
