import { ApiResponse } from "apisauce";
import { apiCall } from "./auth.api";

export type BulkDeleteResource =
  | "ads"
  | "users"
  | "clients"
  | "categories"
  | "genres"
  | "casts"
  | "giftcards"
  | "plans"
  | "lives"
  | "uploads"
  | "upcoming"
  | "featured"
  | "suggestions";

export type BulkDeleteResponse = {
  status: number;
  message: string;
  data: {
    requested: number;
    deleted: number;
    failed: Array<{ id: string; message: string }>;
  };
};

export const bulkDeleteRecords = async (
  resource: BulkDeleteResource,
  ids: string[],
): Promise<ApiResponse<BulkDeleteResponse>> =>
  apiCall<BulkDeleteResponse>((baseApi) =>
    baseApi.delete<BulkDeleteResponse>(
      "/superadmin/bulk-delete",
      undefined,
      { data: { resource, ids } },
    ),
  );
