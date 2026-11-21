import { SuperUserResponse, UserResponse } from "@/types/api/profile.types";
import { ApiResponse, create } from "apisauce";
import { MAIN_API_BASE_URL } from "@/config/api";

export const createAuth = create({
  baseURL: MAIN_API_BASE_URL,
  timeout: 12000,
  timeoutErrorMessage: "Request timed out",
});

export const createAdminAuthWrapper = async (isClient?:boolean) => {
  const token = localStorage.getItem(isClient ? "auth_token": "superadmin_token");
  const api = create({
    baseURL: MAIN_API_BASE_URL,
    // Large media uploads can take several minutes on slower connections.
    timeout: 30 * 60 * 1000,
    timeoutErrorMessage: "Upload timed out. Check your connection and try again.",
    headers: {
      [isClient ? "clients-auth" :"superadmin-auth"]: token,
    },
  });

  api.addRequestTransform((request) => {
    if (typeof FormData !== "undefined" && request.data instanceof FormData) {
      // Apisauce defaults every request to application/json. Leaving that
      // header in place makes Axios serialize FormData (and its File) as JSON.
      // Removing it lets the browser generate multipart/form-data with the
      // required boundary, so Multer can receive the uploaded file.
      delete request.headers?.["Content-Type"];
      delete request.headers?.["content-type"];
    }
  });

  return api;
};

export const apiCall = async <T>(
  apiFunction: (baseApi: ReturnType<typeof create>) => Promise<ApiResponse<T>>,
  isClient?:boolean
): Promise<ApiResponse<T>> => {
  const baseApi = await createAdminAuthWrapper(isClient);
  return apiFunction(baseApi);
};

export const getSuperadminProfile = async (token: string) =>
  await createAuth.get<SuperUserResponse>(
    "/superadmin/dashboard/profile/fetch",
    {},
    {
      headers: {
        "superadmin-auth": token,
      },
    }
  );

export const getClientProfile = async (token: string) =>
  await createAuth.get<UserResponse>(
    "/clients/profile/fetch",
    {},
    {
      headers: {
        "clients-auth": token,
      },
    }
  );
