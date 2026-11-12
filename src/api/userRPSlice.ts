import {
  IAddFeatured,
  IFeaturedContentResponse,
} from "@/types/api/featured.types";
import { apiSlice } from "./apiSlice";
import { apiCall, createAuth } from "./auth.api";
import { IEditUserRP, IUserResponse, IUsersResponse } from "@/types/api/users.types";
import { IGeneric } from "@/types/api/auth.types";
import { IPagination } from "@/types/api/suggestion.types";

export const userRPApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<IUsersResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `superadmin/user/fetch?page=${data.page}&limit=${data.limit}`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),
  }),
});

export const { useGetUsersQuery } = userRPApiSlice;

export const deleteUsers = async (data: string) =>
  await apiCall((baseApi) =>
    baseApi.delete<IGeneric>(`/superadmin/user/deleteUser/${data}`)
  );

export const updateUsers = async (data: FormData, _id: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.put<IGeneric>(`/superadmin/user-profile/shared/update/${_id}`, data)
  );

export const getAllUsers = async (data: IPagination) =>
  await apiCall<IUsersResponse>((baseApi) =>
    baseApi.get<IUsersResponse>(`/superadmin/user/fetch?page=${data.page}&limit=${data.limit}`)
  );

export const usersbyID = async (_id: string) =>
  await apiCall<IUserResponse>((baseApi) =>
    baseApi.get<IUserResponse>(`/superadmin/user/fetch/${_id}`)
  );
