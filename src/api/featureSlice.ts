import {
  IAddFeatured,
  IFeaturedContentResponse,
} from "@/types/api/featured.types";
import { apiSlice } from "./apiSlice";
import { apiCall, createAuth } from "./auth.api";
import { IContentSearchResponse, IUpcomingQuery, IUpcomingResponse } from "@/types/api/upcoming.types";

export const featuredApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchFeaturedContent: builder.mutation<IFeaturedContentResponse, string>({
      query: (data) => ({
        url: `/superadmin/shared/featured/contents/search${data}`,
        method: "GET",
      }),
    }),

    getFeatures: builder.query<IFeaturedContentResponse, IUpcomingQuery>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/featured/contents/fetch?page=${data.page}&limit=${data.limit}`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),
  }),
});

export const { useSearchFeaturedContentMutation, useGetFeaturesQuery } = featuredApiSlice;

export const searchFeaturedContent = async (data: string) =>
  await apiCall((baseApi) =>
    baseApi.get<IContentSearchResponse>(
      `/superadmin/shared/featured/contents/search/${data}`
    )
  );

export const addFeaturedContent = async (data: IAddFeatured) =>
  await apiCall((baseApi) =>
    baseApi.post("/superadmin/featured/contents/add", data)
  );

export const getFeaturedEvent = async (query: IUpcomingQuery = { page: 1, limit: 50 }) =>
  await apiCall<IFeaturedContentResponse>((baseApi) =>
    baseApi.get<IFeaturedContentResponse>(
      `/superadmin/featured/contents/fetch?page=${query.page}&limit=${query.limit}`
    )
  );
