import { IGeneric, LoginRequest, LoginResponse, SuperadminClientLoginRequest } from "@/types/api/auth.types";
import { apiSlice } from "./apiSlice";
import { SUCESS_CODES } from "@/screens/Login";
import {
  IEditUser,
  SuperUserResponse,
  UserResponse,
} from "@/types/api/profile.types";
import { MAIN_API_BASE_URL } from "@/config/api";

const CLIENT_URL = "clients";
const SUPERADMIN_URL = "superadmin";
const mainApiUrl = (path: string) =>
  `${MAIN_API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: mainApiUrl("/superadmin/auth/login"),
        method: "POST",
        body: data,
      }),
      // Save the token to localStorage after successful login
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (SUCESS_CODES.includes(data.status)) {
            localStorage.setItem(data.data.role === 'superadmin' ? "superadmin_token" : "auth_token", data.data.token); // Save token in localStorage
            console.log("Token saved");
          }
        } catch (error) {
          console.error("Login error:", error);
        }
      },
    }),

    superadminClientRedirect: builder.mutation<LoginResponse, SuperadminClientLoginRequest>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
        url: mainApiUrl("/superadmin/client-redirect/login"),
        method: "POST",
         headers: {
            "superadmin-auth": `${authToken}`,
          },
        body: data,
      }},
      // Save the token to localStorage after successful login
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (SUCESS_CODES.includes(data.status)) {
            localStorage.setItem("auth_token", data.data.token);
            console.log("Token saved");
          }
        } catch (error) {
          console.error("Login error:", error);
        }
      },
    }),

    getUserProfile: builder.query<UserResponse, void>({
      query: () => {
        const authToken = localStorage.getItem("auth_token");
        return {
          url: mainApiUrl(`${CLIENT_URL}/profile/fetch`),
          method: "GET",
          headers: {
            "clients-auth": `${authToken}`,
          },
        };
      },
    }),

    getSuperAdminProfile: builder.query<SuperUserResponse, void>({
      query: () => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: mainApiUrl(`${SUPERADMIN_URL}/dashboard/profile/fetch`),
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    editProfile: builder.mutation<IGeneric, IEditUser>({
      query: (data) => ({
        url: mainApiUrl("/superadmin/dashboard/profile/edit"),
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetUserProfileQuery,
  useGetSuperAdminProfileQuery,
  useEditProfileMutation,
  useSuperadminClientRedirectMutation
} = userApiSlice;
