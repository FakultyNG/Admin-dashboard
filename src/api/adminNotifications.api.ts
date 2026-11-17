import { apiCall } from "./auth.api";
import { IGeneric } from "@/types/api/auth.types";

export type AdminNotificationCategory =
  | "suggestions"
  | "new_services"
  | "upcoming_events"
  | "new_arrivals"
  | "live_channels"
  | "system";

export interface AdminNotificationItem {
  _id: string;
  title: string;
  description: string;
  category: AdminNotificationCategory;
  route?: string;
  hasSeen: boolean;
  createdAt: string;
}

interface InboxResponse extends IGeneric { data: AdminNotificationItem[] }
interface CountResponse extends IGeneric { data: { count: number } }
interface SettingsResponse extends IGeneric {
  data: { soundName: string | null; soundUrl: string | null };
}

export const getAdminNotificationInbox = () =>
  apiCall<InboxResponse>(api => api.get("/superadmin/notifications/inbox?limit=20&page=1"));

export const getAdminNotificationUnreadCount = () =>
  apiCall<CountResponse>(api => api.get("/superadmin/notifications/unread-count"));

export const markAllAdminNotificationsRead = () =>
  apiCall<IGeneric>(api => api.put("/superadmin/notifications/mark-all-read"));

export const getAdminNotificationSettings = () =>
  apiCall<SettingsResponse>(api => api.get("/superadmin/notifications/settings"));

export const updateAdminNotificationSound = (sound: File) => {
  const formData = new FormData();
  formData.append("sound", sound);
  return apiCall<SettingsResponse>(api =>
    api.put("/superadmin/notifications/settings/sound", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
};

