import { LoginRequest, LoginResponse } from "@/types/api/auth.types";
import { apiSlice } from "./apiSlice";
import { SUCESS_CODES } from "@/screens/Login";
import { SuperUserResponse, UserResponse } from "@/types/api/profile.types";
import {
  IDashboardTOTAL_Contents,
  IDashboardTOTAL_Users,
  ILivestreamDetailsResponse,
  IAnalyticsOverviewResponse,
} from "@/types/api/dashboard.types";

const SUPERADMIN_URL = "superadmin";
const CLIENT_URL = "clients";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardContentList: builder.query<IDashboardTOTAL_Contents, void>({
      query: () => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `${SUPERADMIN_URL}/dashboard/totcontentsandchunks`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getDashboardTotalUser: builder.query<IDashboardTOTAL_Users, void>({
      query: () => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `${SUPERADMIN_URL}/dashboard/fetchbalanceandusers`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getAnalyticsOverview: builder.query<IAnalyticsOverviewResponse, number>({
      query: (days) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `${SUPERADMIN_URL}/dashboard/analytics?days=${days}`,
          method: "GET",
          headers: { "superadmin-auth": `${authToken}` },
        };
      },
    }),


    getLivestreamDetails: builder.query<ILivestreamDetailsResponse, void>({
      query: () => {
        const authToken = localStorage.getItem("auth_token");
        return {
          url: `${CLIENT_URL}/livestream/streamkey`,
          method: "GET",
          headers: {
            "clients-auth": `${authToken}`,
          },
        };
      },
    }),
  }),
});

export const {
  useGetDashboardContentListQuery,
  useGetDashboardTotalUserQuery,
  useGetLivestreamDetailsQuery
  ,useGetAnalyticsOverviewQuery
} = dashboardApiSlice;
