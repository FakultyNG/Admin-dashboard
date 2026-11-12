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
  return create({
    baseURL: MAIN_API_BASE_URL,
    headers: {
      [isClient ? "clients-auth" :"superadmin-auth"]: token,
    },
  });
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
