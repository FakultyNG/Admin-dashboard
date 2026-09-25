import {
  ICategoryResponse,
  ICastResponse,
  IAddCategory,
} from "@/types/api/category.types";
import { apiSlice } from "./apiSlice";
import { apiCall } from "./auth.api";
import { IGeneric } from "@/types/api/auth.types";
import { IPagination } from "@/types/api/suggestion.types";
import {
  ICreateLiveContentResponse,
  IEventResponse,
} from "@/types/api/live.types";

export const liveApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<IEventResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/lives/all/event?limit=${data.limit}&page=${data.page}`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getChannels: builder.query<IEventResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/lives/all/channel?limit=${data.limit}&page=${data.page}`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getTVShows: builder.query<IEventResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/lives/all/tvshow?limit=${data.limit}&page=${data.page}`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getPodcast: builder.query<IEventResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/lives/all/podcast?limit=${data.limit}&page=${data.page}`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getSport: builder.query<IEventResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/lives/all/sport?limit=${data.limit}&page=${data.page}`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useGetEventsQuery,
  useGetTVShowsQuery,
  useGetPodcastQuery,
  useGetSportQuery,
} = liveApiSlice;

export const getFetchTVShows = async (data: IPagination) =>
  await apiCall<IEventResponse>((baseApi) =>
    baseApi.get<IEventResponse>(
      `/superadmin/lives/all/tvshow?limit=${data.limit}&page=${data.page}`,
    ),
  );

export const getFetchEvents = async (data: IPagination) =>
  await apiCall<IEventResponse>((baseApi) =>
    baseApi.get<IEventResponse>(
      `/superadmin/lives/all/event?limit=${data.limit}&page=${data.page}`,
    ),
  );

export const getFetchChannels = async (data: IPagination) =>
  await apiCall<IEventResponse>((baseApi) =>
    baseApi.get<IEventResponse>(
      `/superadmin/lives/all/channel?limit=${data.limit}&page=${data.page}`,
    ),
  );
export const getFetchPodcast = async (data: IPagination) =>
  await apiCall<IEventResponse>((baseApi) =>
    baseApi.get<IEventResponse>(
      `/superadmin/lives/all/podcast?limit=${data.limit}&page=${data.page}`,
    ),
  );
export const getFetchSport = async (data: IPagination) =>
  await apiCall<IEventResponse>((baseApi) =>
    baseApi.get<IEventResponse>(
      `/superadmin/lives/all/sport?limit=${data.limit}&page=${data.page}`,
    ),
  );

export const createLive = async (data: FormData) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.post<IGeneric>(`/superadmin/lives/create`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );

export const clientCreateLive = async (data: FormData) =>
  await apiCall<ICreateLiveContentResponse>(
    (baseApi) =>
      baseApi.post<ICreateLiveContentResponse>(
        `/clients/shared/lives/create`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      ),
    true,
  );

export const deleteLive = async (data: { _id: string }) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.delete<IGeneric>(`/superadmin/shared/lives/delete/${data._id}`),
  );
