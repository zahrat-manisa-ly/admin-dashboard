/** Contracts from /api/v1/notifications (excluding mobile-push). */

export type NotificationReadFilter = "all" | "read" | "unread";

export interface Notification {
  id: string;
  body: string;
  icon?: string | null;
  url?: string | null;
  data?: Record<string, unknown>;
  is_read?: boolean;
  read_at?: string | null;
  is_todo?: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  next?: number | null;
  total: number;
  is_read_count: number;
}

export interface ListNotificationsParams {
  size?: number;
  cursor?: number;
  readStatus?: NotificationReadFilter;
}

export interface MarkAllNotificationsReadResponse {
  updated: number;
}

export interface DeleteAllNotificationsResponse {
  deleted: number;
}
