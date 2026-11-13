import { IGeneric } from "@/types/api/auth.types";
import { apiCall } from "./auth.api";
import { ISeasonResponse, ISubtitleResponse } from "@/types/api/content.type";

export const createContent = async (data: FormData, type: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.post<IGeneric>(`/superadmin/uploads/video/add/${type}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );

export const editContent = async (data: FormData, id: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.put<IGeneric>(`/superadmin/uploads/edit/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );

export const editContentTaxonomy = async (
  id: string,
  data: { category: string[]; genre: string[] },
) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.put<IGeneric>(`/superadmin/uploads/edit/${id}`, data),
  );

export const addSeason = async (seriesId: string) =>
  await apiCall<ISeasonResponse>((baseApi) =>
    baseApi.post<ISeasonResponse>(`/superadmin/uploads/seasons/add/${seriesId}`, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );

export const seriesButtonValidity = async (id: string, type: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.get<IGeneric>(`/superadmin/uploads/${type}/can-add/${id}`)
  );

export const addSubtitle = async (data: FormData) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.post<IGeneric>(`/superadmin/media/add-subtitle`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );

export const addEpisodes = async (data: FormData, seasonId: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.post<IGeneric>(`/superadmin/uploads/episodes/add/${seasonId}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );

export const deleteContent = async (data: { id: string, slug: string }) =>
  await apiCall<IGeneric>(baseApi => baseApi.delete<IGeneric>(`/superadmin/uploads/remove/${data.id}/${data.slug}`))

export const getSeasons = async (data: { id: string }) =>
  await apiCall<ISeasonResponse>(baseApi => baseApi.get<ISeasonResponse>(`/superadmin/uploads/seasons/fetch/${data.id}?page=1&limit=40000&withMediaSources=true`))

export const getSubtitles = async (data: { id: string, type:'vod' | 'episode' | 'series' }) =>
  await apiCall<ISubtitleResponse>(baseApi => baseApi.get<ISubtitleResponse>(`/superadmin/shared/subtitles/fetch/${data.id}/${data.type}`))

export const deleteSubtitles = async (data: { id: string }) =>
  await apiCall<IGeneric>(baseApi => baseApi.delete<IGeneric>(`/superadmin/media/delete-subtitle/${data.id}`))
