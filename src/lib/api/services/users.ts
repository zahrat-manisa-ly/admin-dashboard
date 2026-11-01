import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { authorizationApi } from "@/lib/api/services/authorization";
import type {
  CreateUserRequest,
  Invitation,
  InvitationResendRequest,
  ListInvitationsParams,
  Page,
  UpdateEmployeeRequest,
  User,
} from "@/lib/api/types/users";

export const usersApi = {
  async list(page: number, size: number, signal?: AbortSignal): Promise<Page<User>> {
    return (await apiClient.get<Page<User>>(endpoints.usersV1.list, { params: { page, size }, signal })).data;
  },
  async get(id: string, signal?: AbortSignal): Promise<User> {
    return (await apiClient.get<User>(endpoints.usersV1.detail(id), { signal })).data;
  },
  async create(input: CreateUserRequest): Promise<Invitation> {
    return (await apiClient.post<Invitation>(endpoints.usersV1.list, input)).data;
  },
  async invitations(params: ListInvitationsParams, signal?: AbortSignal): Promise<Page<Invitation>> {
    return (
      await apiClient.get<Page<Invitation>>(endpoints.usersV1.invitations, {
        params: {
          page: params.page,
          size: params.size,
          include_history: params.includeHistory ?? false,
        },
        signal,
      })
    ).data;
  },
  async resendInvitation(id: string, input: InvitationResendRequest = {}): Promise<void> {
    await apiClient.post(endpoints.usersV1.invitationResend(id), input);
  },
  async revokeInvitation(id: string): Promise<void> {
    await apiClient.post(endpoints.usersV1.invitationRevoke(id));
  },
  async update(id: string, input: UpdateEmployeeRequest): Promise<User> {
    return (await apiClient.patch<User>(endpoints.usersV1.employee(id), input)).data;
  },
  async setBlocked(id: string, is_blocked: boolean): Promise<User> {
    return (await apiClient.patch<User>(endpoints.usersV1.blocking(id), { is_blocked })).data;
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(endpoints.usersV1.detail(id));
  },
  roles(signal?: AbortSignal) {
    return authorizationApi.roles(signal);
  },
};
