"use client";

import { CustomerWalletsPanel } from "./customer-wallets-panel";
import { MerchantOverview } from "./merchant-wallet-card";

export function WalletsWorkspace() {
  return (
    <div className="flex flex-col gap-5">
      {/* //--------merchant-overview----// */}
      <MerchantOverview />
      {/* //-------end-merchant-overview----// */}

      {/* //--------customer-wallets----// */}
      <CustomerWalletsPanel />
      {/* //-------end-customer-wallets----// */}
    </div>
  );
}
