import { IPagination } from "@/types/api/suggestion.types";
import { apiSlice } from "./apiSlice";
import { apiCall } from "./auth.api";
import { IGeneric } from "@/types/api/auth.types";
import { IMediaResponse, IMediaSeriesResponse } from "@/types/api/media.types";

export const mediaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllMovie: builder.query<IMediaResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/uploads/fetch/movie?page=${data.page}&limit=${data.limit}&withMediaSources=true`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getAllSkits: builder.query<IMediaResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/uploads/fetch/skit?page=${data.page}&limit=${data.limit}&withMediaSources=true`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getAllMusic: builder.query<IMediaResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/uploads/fetch/music-video?page=${data.page}&limit=${data.limit}&withMediaSources=true`,
          method: "GET",
          headers: {
            "superadmin-auth": `${authToken}`,
          },
        };
      },
    }),

    getAllSeries: builder.query<IMediaResponse, IPagination>({
      query: (data) => {
        const authToken = localStorage.getItem("superadmin_token");
        return {
          url: `/superadmin/uploads/fetch/series?page=${data.page}&limit=${data.limit}&withMediaSources=true`,
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
  useGetAllMovieQuery,
  useGetAllMusicQuery,
  useGetAllSeriesQuery,
  useGetAllSkitsQuery,
} = mediaApiSlice;

export const getFetchMovies = async (data: IPagination) =>
  await apiCall<IMediaResponse>((baseApi) =>
    baseApi.get<IMediaResponse>(
      `/superadmin/uploads/fetch/movie?page=${data.page}&limit=${data.limit}&withMediaSources=true`,
    ),
  );

export const getFetchSkit = async (data: IPagination) =>
  await apiCall<IMediaResponse>((baseApi) =>
    baseApi.get<IMediaResponse>(
      `/superadmin/uploads/skit/fetch?page=${data.page}&limit=${data.limit}`,
    ),
  );

export const getFetchMusicVideo = async (data: IPagination) =>
  await apiCall<IMediaResponse>((baseApi) =>
    baseApi.get<IMediaResponse>(
      `/superadmin/uploads/fetch/music-video?page=${data.page}&limit=${data.limit}`,
    ),
  );

export const getFetchSeries = async (data: IPagination) =>
  await apiCall<IMediaResponse>((baseApi) =>
    baseApi.get<IMediaResponse>(
      `/superadmin/uploads/fetch/series?page=${data.page}&limit=${data.limit}`,
    ),
  );

// export const addCategoryEnums = async (data: IAddCategory, path: string) =>
//   await apiCall<IGeneric>((baseApi) =>
//     baseApi.post<IGeneric>(`/superadmin/enums/add-${path}`, data)
//   );

// export const deleteMedia = async (_id: string, path: string) => await apiCall<IGeneric>(baseApi => baseApi.delete(`/superadmin/enums/rem-${path}/${_id}`))
