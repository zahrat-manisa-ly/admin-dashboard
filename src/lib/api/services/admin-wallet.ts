import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CreateCustomerWalletRequest,
  CustomerWallet,
  CustomerWalletPage,
  FreezeDecision,
  FreezeWalletResponse,
  ListCustomerWalletsParams,
  MerchantWalletHistoryParams,
  MerchantWalletHistoryResponse,
  MerchantWalletSummary,
  WalletConfiguration,
  WalletResponse,
} from "@/lib/api/types/admin-wallet";

export const adminWalletApi = {
  //--------configuration----//
  async getConfiguration(signal?: AbortSignal): Promise<WalletConfiguration> {
    return (await apiClient.get<WalletConfiguration>(endpoints.adminWalletV1.configuration, { signal })).data;
  },
  //-------end-configuration----//

  //--------customer-wallets----//
  async listCustomerWallets(params: ListCustomerWalletsParams = {}, signal?: AbortSignal): Promise<CustomerWalletPage> {
    return (
      await apiClient.get<CustomerWalletPage>(endpoints.adminWalletV1.customers, {
        params: {
          ...(params.page !== undefined ? { page: params.page } : {}),
          ...(params.size !== undefined ? { size: params.size } : {}),
        },
        signal,
      })
    ).data;
  },

  async getCustomerWallet(userId: string, signal?: AbortSignal): Promise<CustomerWallet> {
    return (await apiClient.get<CustomerWallet>(endpoints.adminWalletV1.customer(userId), { signal })).data;
  },

  async createCustomerWallet(userId: string, input: CreateCustomerWalletRequest = {}): Promise<WalletResponse> {
    return (await apiClient.post<WalletResponse>(endpoints.adminWalletV1.customer(userId), input)).data;
  },
  //-------end-customer-wallets----//

  //--------wallet-freezes----//
  async freezeCustomerWallet(userId: string, input: FreezeDecision): Promise<FreezeWalletResponse> {
    return (
      await apiClient.post<FreezeWalletResponse>(endpoints.adminWalletV1.customerFreeze(userId), input, {
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
      })
    ).data;
  },
  //-------end-wallet-freezes----//

  //--------merchant-wallet----//
  async getMerchantWallet(signal?: AbortSignal): Promise<MerchantWalletSummary> {
    return (await apiClient.get<MerchantWalletSummary>(endpoints.adminWalletV1.merchant, { signal })).data;
  },

  async getMerchantWalletHistory(
    params: MerchantWalletHistoryParams = {},
    signal?: AbortSignal,
  ): Promise<MerchantWalletHistoryResponse> {
    return (
      await apiClient.get<MerchantWalletHistoryResponse>(endpoints.adminWalletV1.merchantHistory, {
        params: {
          ...(params.limit !== undefined ? { limit: params.limit } : {}),
          ...(params.beforeJournalId ? { before_journal_id: params.beforeJournalId } : {}),
        },
        signal,
      })
    ).data;
  },
  //-------end-merchant-wallet----//
};
