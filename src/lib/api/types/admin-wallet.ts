import type { Page } from "@/lib/api/types/users";

/** Contracts for the Admin wallet tag: /api/v1/admin/wallet. */

//--------configuration----//
/** GET /api/v1/admin/wallet/configuration */
export interface WalletConfiguration {
  merchant_wallet_id: string | null;
  tlync_settlement_source_id: string | null;
  cash_settlement_source_id: string | null;
}
//-------end-configuration----//

//--------customer-wallets----//
export type WalletCurrencyCode = "LYD";
export type WalletKind = "customer" | "merchant";

/** POST /api/v1/admin/wallet/customers/{user_id} */
export interface CreateCustomerWalletRequest {
  currency_code?: WalletCurrencyCode;
}

export interface WalletResponse {
  wallet_id: string;
  wallet_code?: string | null;
  currency_code: string;
  owner_id: string;
  wallet_type: WalletKind;
}

/** GET /api/v1/admin/wallet/customers/{user_id} */
export interface CustomerWallet extends WalletResponse {
  user_id: string;
  user_name: string | null;
}

/** Item inside GET /api/v1/admin/wallet/customers */
export interface CustomerWalletMapping {
  user_id: string;
  wallet_id: string;
  owner_id: string;
  kyc_verified: boolean;
  user_name?: string | null;
}

export type CustomerWalletPage = Page<CustomerWalletMapping>;

export interface ListCustomerWalletsParams {
  page?: number;
  size?: number;
}
//-------end-customer-wallets----//

//--------wallet-freezes----//
/** POST /api/v1/admin/wallet/customers/{user_id}/freeze */
export interface FreezeDecision {
  frozen: boolean;
  reason: string;
}

/**
 * The OpenAPI document does not declare the freeze response body.
 * Keep this unknown until the response contract is published.
 */
export type FreezeWalletResponse = unknown;
//-------end-wallet-freezes----//

//--------merchant-wallet----//
/** Amounts are the API minor-unit strings, not display decimals. */
export interface MerchantWalletSummary {
  currency_code: string;
  book_balance_minor: string;
  reserved_minor: string;
  available_balance_minor: string;
  wallet_id: string;
  wallet_code?: string | null;
  owner_id: string;
  wallet_type: WalletKind;
}

/** GET /api/v1/admin/wallet/merchant/history */
export interface MerchantWalletHistoryParams {
  limit?: number;
  beforeJournalId?: string | null;
}

/**
 * The OpenAPI document does not declare the journal body.
 * Keep this unknown until the response contract is published.
 */
export type MerchantWalletHistoryResponse = unknown;
//-------end-merchant-wallet----//
