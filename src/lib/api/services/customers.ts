import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CustomerListResponse, ListCustomersParams, User } from "@/lib/api/types/users";

export const customersApi = {
  async list(params: ListCustomersParams, signal?: AbortSignal): Promise<CustomerListResponse> {
    const search = params.search?.trim();
    return (
      await apiClient.get<CustomerListResponse>(endpoints.usersV1.customers, {
        params: {
          page: params.page,
          size: params.size,
          ...(search ? { search } : {}),
        },
        signal,
      })
    ).data;
  },
  async get(id: string, signal?: AbortSignal): Promise<User> {
    return (await apiClient.get<User>(endpoints.usersV1.customer(id), { signal })).data;
  },
};
