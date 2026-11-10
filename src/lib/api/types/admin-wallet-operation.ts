/** Contracts for the Admin wallet operation tag: /api/v1/admin/wallet. */

//--------withdrawals----//
export interface ListAdminWithdrawalsParams {
  page?: number;
  size?: number;
  status?: string | null;
}

/**
 * The OpenAPI document does not declare the withdrawals list body.
 * Keep this unknown until the response contract is published.
 */
export type AdminWithdrawalsResponse = unknown;

/**
 * The OpenAPI document does not declare the withdrawal detail body.
 * Keep this unknown until the response contract is published.
 */
export type AdminWithdrawalResponse = unknown;

export type WithdrawalAction = "approve" | "reject" | "start" | "settle" | "fail" | "unknown";

/** POST /api/v1/admin/wallet/withdrawals/{withdrawal_id}/actions/{action} */
export interface WithdrawalActionDetails {
  evidence_id?: string | null;
  reason?: string | null;
  evidence_reference?: string | null;
  note?: string | null;
}

/**
 * The OpenAPI document does not declare the withdrawal action response body.
 * Keep this unknown until the response contract is published.
 */
export type WithdrawalActionResponse = unknown;
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
 * The OpenAPI document does not declare the transfers list body.
 * Keep this unknown until the response contract is published.
 */
export type AdminTransfersResponse = unknown;

/**
 * The OpenAPI document does not declare the transfer detail body.
 * Keep this unknown until the response contract is published.
 */
export type AdminTransferResponse = unknown;
//-------end-transfers----//
