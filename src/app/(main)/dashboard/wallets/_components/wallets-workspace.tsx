"use client";

import { CustomerWalletsPanel } from "./customer-wallets-panel";
import { MerchantOverview } from "./merchant-wallet-card";
import { MerchantWalletHistory } from "./merchant-wallet-history";

export function WalletsWorkspace() {
  return (
    <div className="flex flex-col gap-5">
      {/* //--------merchant-overview----// */}
      <MerchantOverview />
      {/* //-------end-merchant-overview----// */}

      {/* //--------merchant-history----// */}
      <MerchantWalletHistory />
      {/* //-------end-merchant-history----// */}

      {/* //--------customer-wallets----// */}
      <CustomerWalletsPanel />
      {/* //-------end-customer-wallets----// */}
    </div>
  );
}
