import type { Page } from "@/lib/api/types/users";

/** Contracts for the Admin wallet operation tag: /api/v1/admin/wallet. */

//--------withdrawals----//
export interface ListAdminWithdrawalsParams {
  page?: number;
  size?: number;
  status?: string | null;
}

export type BankAccountType = "individual" | "merchant" | "student";

export interface BankAccountDetails {
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  iban_number: string;
  account_type: BankAccountType;
  bank_branch?: string | null;
}

/** Item inside GET /api/v1/admin/wallet/withdrawals */
export interface AdminWithdrawalResponse {
  id: string;
  status: string;
  pending_action: string | null;
  currency_code: string;
  amount_minor: string;
  fee_minor: string | null;
  total_deduction_minor: string | null;
  created_at: string;
  kind: "withdrawal";
  bankaccount_id: string;
  expires_at: string | null;
  preview_expires_at?: string | null;
  evidence_path: string;
  user_id: string;
  user_name?: string | null;
  payout_reference?: string | null;
}

/** GET /api/v1/admin/wallet/withdrawals/{withdrawal_id} */
export interface AdminWithdrawalDetail extends AdminWithdrawalResponse {
  bank_details: BankAccountDetails;
}

export type AdminWithdrawalPage = Page<AdminWithdrawalResponse>;

export type WithdrawalAction = "approve" | "reject" | "start" | "settle" | "fail" | "unknown";

/** POST /api/v1/admin/wallet/withdrawals/{withdrawal_id}/actions/{action} */
export interface WithdrawalActionDetails {
  evidence_id?: string | null;
  reason?: string | null;
  evidence_reference?: string | null;
  note?: string | null;
}

/** Response of POST .../actions/{action} */
export interface WithdrawalActionResponse extends AdminWithdrawalResponse {
  payout_claimed?: boolean;
}
//-------end-withdrawals----//

//--------withdrawal-evidence----//
/** POST /api/v1/admin/wallet/withdrawals/{withdrawal_id}/evidence */
export interface EvidenceUploadResponse {
  evidence_id: string;
  content_type: string;
  size: number;
}

/** GET /api/v1/admin/wallet/withdrawals/{withdrawal_id}/evidence */
export interface EvidenceDownloadResponse {
  url: string;
  expires_in: number;
  content_type: string;
  evidence_id: string;
  size: number;
}
//-------end-withdrawal-evidence----//

//--------transfers----//
export interface ListAdminTransfersParams {
  page?: number;
  size?: number;
  status?: string | null;
}

/**
 * Item for GET /api/v1/admin/wallet/transfers
 * and GET /api/v1/admin/wallet/transfers/{transfer_id}
 */
export interface TransferResponse {
  id: string;
  status: string;
  pending_action: string | null;
  currency_code: string;
  amount_minor: string;
  fee_minor: string | null;
  total_deduction_minor: string | null;
  created_at: string;
  kind: "transfer";
  sender_name: string | null;
  recipient_name: string | null;
  expires_at?: string | null;
}

export type AdminTransferPage = Page<TransferResponse>;
//-------end-transfers----//
