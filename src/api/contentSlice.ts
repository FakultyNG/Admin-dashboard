import { IGeneric } from "@/types/api/auth.types";
import { apiCall } from "./auth.api";
import {
  IContentMutationResponse,
  IContentProcessingResponse,
  IEpisodeMutationResponse,
  ISeasonMutationResponse,
  ISeasonResponse,
  ISubtitleResponse,
} from "@/types/api/content.type";

export interface MultipartUploadSession {
  sessionId: string;
  partSize: number;
  totalParts: number;
  expiresAt: string;
}

export interface MultipartUploadStatus extends MultipartUploadSession {
  status: "active" | "uploaded" | "completed" | "aborted";
  uploadedParts: Array<{ PartNumber: number; ETag: string; Size: number }>;
  videoUploadId: string | null;
}

interface DataResponse<T> extends IGeneric { data: T }

export const initiateMultipartUpload = async (data: {
  fileName: string;
  contentType: string;
  size: number;
  mediaKind: "main" | "trailer";
  target: "vod" | "episode";
}) => await apiCall<DataResponse<MultipartUploadSession>>((baseApi) =>
  baseApi.post("/superadmin/uploads/multipart/initiate", data),
);

export const getMultipartUploadStatus = async (sessionId: string) =>
  await apiCall<DataResponse<MultipartUploadStatus>>((baseApi) =>
    baseApi.get(`/superadmin/uploads/multipart/${sessionId}`),
  );

export const signMultipartUploadParts = async (sessionId: string, partNumbers: number[]) =>
  await apiCall<DataResponse<Array<{ partNumber: number; url: string }>>>((baseApi) =>
    baseApi.post(`/superadmin/uploads/multipart/${sessionId}/parts`, { partNumbers }),
  );

export const completeMultipartUpload = async (sessionId: string) =>
  await apiCall<DataResponse<{ videoUploadId: string; status: string }>>((baseApi) =>
    baseApi.post(`/superadmin/uploads/multipart/${sessionId}/complete`),
  );

export const abortMultipartUpload = async (sessionId: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.delete(`/superadmin/uploads/multipart/${sessionId}`),
  );

export const getContentProcessingStatus = async (id: string, live = true) =>
  await apiCall<IContentProcessingResponse>((baseApi) =>
    baseApi.get<IContentProcessingResponse>(
      `/superadmin/uploads/status/${id}?live=${live}`,
    ),
  );

export const createContent = async (data: FormData, type: string) =>
  await apiCall<IContentMutationResponse>((baseApi) =>
    baseApi.post<IContentMutationResponse>(`/superadmin/uploads/video/add/${type}`, data),
  );

export const editContent = async (data: FormData, id: string) =>
  await apiCall<IContentMutationResponse>((baseApi) =>
    baseApi.put<IContentMutationResponse>(`/superadmin/uploads/edit/${id}`, data),
  );

export const editContentTaxonomy = async (
  id: string,
  data: { category: string[]; genre: string[] },
) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.put<IGeneric>(`/superadmin/uploads/edit/${id}`, data),
  );

export const addSeason = async (seriesId: string, description?: string) =>
  await apiCall<ISeasonMutationResponse>((baseApi) =>
    baseApi.post<ISeasonMutationResponse>(
      `/superadmin/uploads/seasons/add/${seriesId}`,
      description?.trim() ? { description: description.trim() } : {},
    ),
  );

export const seriesButtonValidity = async (id: string, type: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.get<IGeneric>(`/superadmin/uploads/${type}/can-add/${id}`),
  );

export const addSubtitle = async (data: FormData) =>
  await apiCall<IGeneric>((baseApi) =>
    // Do not set Content-Type manually. The browser must add the multipart
    // boundary generated for this FormData instance.
    baseApi.post<IGeneric>(`/superadmin/media/add-subtitle`, data),
  );

export const addEpisodes = async (data: FormData, seasonId: string) =>
  await apiCall<IEpisodeMutationResponse>((baseApi) =>
    baseApi.post<IEpisodeMutationResponse>(`/superadmin/uploads/episodes/add/${seasonId}`, data),
  );

export const editEpisode = async (data: FormData, episodeId: string) =>
  await apiCall<IEpisodeMutationResponse>((baseApi) =>
    baseApi.put<IEpisodeMutationResponse>(`/superadmin/uploads/episodes/edit/${episodeId}`, data),
  );

export const deleteEpisode = async (episodeId: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.delete<IGeneric>(`/superadmin/uploads/episodes/remove/${episodeId}`),
  );

export const deleteSeason = async (seasonId: string) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.delete<IGeneric>(`/superadmin/uploads/seasons/remove/${seasonId}`),
  );

export const deleteContent = async (data: { id: string; slug: string }) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.delete<IGeneric>(
      `/superadmin/uploads/remove/${data.id}/${data.slug}`,
    ),
  );

export const getSeasons = async (data: { id: string }) =>
  await apiCall<ISeasonResponse>((baseApi) =>
    baseApi.get<ISeasonResponse>(
      `/superadmin/uploads/seasons/fetch/${data.id}?page=1&limit=40000&withMediaSources=true`,
    ),
  );

export const getSubtitles = async (data: {
  id: string;
  type: "vod" | "episode" | "series";
}) =>
  await apiCall<ISubtitleResponse>((baseApi) =>
    baseApi.get<ISubtitleResponse>(
      `/superadmin/shared/subtitles/fetch/${data.id}/${data.type}`,
    ),
  );

export const deleteSubtitles = async (data: { id: string }) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.delete<IGeneric>(`/superadmin/media/delete-subtitle/${data.id}`),
  );
