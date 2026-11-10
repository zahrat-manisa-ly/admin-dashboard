import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  DeleteAllNotificationsResponse,
  ListNotificationsParams,
  MarkAllNotificationsReadResponse,
  Notification,
  NotificationListResponse,
} from "@/lib/api/types/notifications";

export const notificationsApi = {
  //--------list----//
  async list(params: ListNotificationsParams = {}, signal?: AbortSignal): Promise<NotificationListResponse> {
    return (
      await apiClient.get<NotificationListResponse>(endpoints.notificationsV1.list, {
        params: {
          size: params.size ?? 10,
          cursor: params.cursor ?? 1,
          read_status: params.readStatus ?? "all",
        },
        signal,
      })
    ).data;
  },
  //-------end-list----//

  //--------detail----//
  async get(id: string, signal?: AbortSignal): Promise<Notification> {
    return (await apiClient.get<Notification>(endpoints.notificationsV1.detail(id), { signal })).data;
  },
  //-------end-detail----//

  //--------read----//
  async markRead(id: string): Promise<Notification> {
    return (await apiClient.patch<Notification>(endpoints.notificationsV1.read(id))).data;
  },
  async markAllRead(): Promise<MarkAllNotificationsReadResponse> {
    return (await apiClient.patch<MarkAllNotificationsReadResponse>(endpoints.notificationsV1.readAll)).data;
  },
  //-------end-read----//

  //--------delete----//
  async delete(id: string): Promise<void> {
    await apiClient.delete(endpoints.notificationsV1.detail(id));
  },
  async deleteAll(): Promise<DeleteAllNotificationsResponse> {
    return (await apiClient.delete<DeleteAllNotificationsResponse>(endpoints.notificationsV1.list)).data;
  },
  //-------end-delete----//
};
