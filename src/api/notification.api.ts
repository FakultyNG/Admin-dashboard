import { apiCall } from "./auth.api";
import { IGeneric } from "@/types/api/auth.types";

export interface BroadcastNotificationInput {
  title: string;
  body: string;
  photo?: File | null;
  audience: "all" | "new_services" | "upcoming_events" | "new_arrivals" | "live_channels";
}

export const broadcastNotification = async ({
  title,
  body,
  photo,
  audience,
}: BroadcastNotificationInput) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("type", "MAIN_ADMIN_TOPIC_NOTIFICATION");
  formData.append("metadata", JSON.stringify({ destination: "notifications" }));
  formData.append("audience", audience);
  if (photo) formData.append("photo", photo);

  return apiCall<IGeneric>((api) =>
    api.post<IGeneric>("/superadmin/user/send-push-notification", formData)
  );
};
