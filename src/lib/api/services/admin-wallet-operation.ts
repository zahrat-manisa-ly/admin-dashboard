import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AdminTransferPage,
  AdminWithdrawalDetail,
  AdminWithdrawalPage,
  EvidenceDownloadResponse,
  EvidenceUploadResponse,
  ListAdminTransfersParams,
  ListAdminWithdrawalsParams,
  TransferResponse,
  WithdrawalAction,
  WithdrawalActionDetails,
  WithdrawalActionResponse,
} from "@/lib/api/types/admin-wallet-operation";

export const adminWalletOperationApi = {
  //--------withdrawals----//
  async listWithdrawals(params: ListAdminWithdrawalsParams = {}, signal?: AbortSignal): Promise<AdminWithdrawalPage> {
    return (
      await apiClient.get<AdminWithdrawalPage>(endpoints.adminWalletV1.withdrawals, {
        params: {
          ...(params.page !== undefined ? { page: params.page } : {}),
          ...(params.size !== undefined ? { size: params.size } : {}),
          ...(params.status ? { status: params.status } : {}),
        },
        signal,
      })
    ).data;
  },

  async getWithdrawal(withdrawalId: string, signal?: AbortSignal): Promise<AdminWithdrawalDetail> {
    return (await apiClient.get<AdminWithdrawalDetail>(endpoints.adminWalletV1.withdrawal(withdrawalId), { signal }))
      .data;
  },

  async applyWithdrawalAction(
    withdrawalId: string,
    action: WithdrawalAction,
    details?: WithdrawalActionDetails | null,
  ): Promise<WithdrawalActionResponse> {
    return (
      await apiClient.post<WithdrawalActionResponse>(
        endpoints.adminWalletV1.withdrawalAction(withdrawalId, action),
        details ?? null,
      )
    ).data;
  },
  //-------end-withdrawals----//

  //--------withdrawal-evidence----//
  async uploadWithdrawalEvidence(withdrawalId: string, file: Blob): Promise<EvidenceUploadResponse> {
    const body = new FormData();
    body.append("file", file);
    return (
      await apiClient.post<EvidenceUploadResponse>(endpoints.adminWalletV1.withdrawalEvidence(withdrawalId), body)
    ).data;
  },

  async getWithdrawalEvidence(withdrawalId: string, signal?: AbortSignal): Promise<EvidenceDownloadResponse> {
    return (
      await apiClient.get<EvidenceDownloadResponse>(endpoints.adminWalletV1.withdrawalEvidence(withdrawalId), {
        signal,
      })
    ).data;
  },
  //-------end-withdrawal-evidence----//

  //--------transfers----//
  async listTransfers(params: ListAdminTransfersParams = {}, signal?: AbortSignal): Promise<AdminTransferPage> {
    return (
      await apiClient.get<AdminTransferPage>(endpoints.adminWalletV1.transfers, {
        params: {
          ...(params.page !== undefined ? { page: params.page } : {}),
          ...(params.size !== undefined ? { size: params.size } : {}),
          ...(params.status ? { status: params.status } : {}),
        },
        signal,
      })
    ).data;
  },

  async getTransfer(transferId: string, signal?: AbortSignal): Promise<TransferResponse> {
    return (await apiClient.get<TransferResponse>(endpoints.adminWalletV1.transfer(transferId), { signal })).data;
  },
  //-------end-transfers----//
};
