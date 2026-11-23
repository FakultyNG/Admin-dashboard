
import { IPagination } from "@/types/api/suggestion.types";
import { apiSlice } from "./apiSlice";
import { apiCall } from "./auth.api";
import { IGiftCardResponse } from "@/types/api/giftCard.types";
import { IAdsResponse, ICampaignAnalyticsResponse, ICampaignDeliveriesResponse } from "@/types/api/ads.types";
import { IGeneric } from "@/types/api/auth.types";

export const adsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getADs: builder.query<IAdsResponse, IPagination>({
            query: (data) => {
                const authToken = localStorage.getItem("superadmin_token");
                return {
                    url: `superadmin/ads/fetchall?limit=${data.limit}&page=${data.page}`,
                    method: "GET",
                    headers: {
                        "superadmin-auth": `${authToken}`,
                    },
                };
            },
        }),
    }),
});

export const { useGetADsQuery } = adsApiSlice;

export const getAllAds = async (data: IPagination) =>
    await apiCall<IAdsResponse>((baseApi) =>
        baseApi.get<IAdsResponse>(
            `superadmin/ads/fetchall?limit=${data.limit}&page=${data.page}`
        )
    );

export const createAds = async (data:FormData) =>
    await apiCall<IGeneric>(baseApi => baseApi.post<IGeneric>('/superadmin/ads/create', data, {
        headers:{
            "Content-Type": "multipart/form-data"
        }
    }))

export const updateAds = async (_id: string, data: FormData) =>
    await apiCall<IGeneric>(baseApi => baseApi.put<IGeneric>(`/superadmin/ads/update/${_id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }))

export const deleteAds = async (_id: string) =>
    await apiCall<IGeneric>((baseApi) =>
        baseApi.delete<IGeneric>(
            `superadmin/ads/remove/${_id}`
        )
    );

export const getCampaignAnalytics = async (_id: string, days = 30) =>
    await apiCall<ICampaignAnalyticsResponse>(baseApi =>
        baseApi.get<ICampaignAnalyticsResponse>(`/superadmin/ads/${_id}/analytics?days=${days}`)
    );

export const getCampaignDeliveries = async (_id: string) =>
    await apiCall<ICampaignDeliveriesResponse>(baseApi =>
        baseApi.get<ICampaignDeliveriesResponse>(`/superadmin/ads/${_id}/report-deliveries`)
    );

export const sendCampaignReport = async (_id: string) =>
    await apiCall<IGeneric>(baseApi => baseApi.post<IGeneric>(`/superadmin/ads/${_id}/send-report`));

export const regenerateCampaignLink = async (_id: string) =>
    await apiCall<IGeneric & {data: {reportLink: string}}>(baseApi =>
        baseApi.post<IGeneric & {data: {reportLink: string}}>(`/superadmin/ads/${_id}/regenerate-report-link`)
    );

export const downloadCampaignCsv = async (_id: string, title: string, days = 30) => {
    const response = await apiCall<ArrayBuffer>(baseApi =>
        baseApi.get<ArrayBuffer>(`/superadmin/ads/${_id}/analytics.csv?days=${days}`, undefined, {responseType: "arraybuffer"})
    );
    if (!response.ok || !response.data) return response;
    const blob = new Blob([response.data], {type: "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-analytics.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    return response;
};
