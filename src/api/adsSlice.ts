
import { IPagination } from "@/types/api/suggestion.types";
import { apiSlice } from "./apiSlice";
import { apiCall } from "./auth.api";
import { IGiftCardResponse } from "@/types/api/giftCard.types";
import { IAdsResponse, IHomeAdsResponse } from "@/types/api/ads.types";
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

export const getHomeAds = async () =>
    await apiCall<IHomeAdsResponse>(baseApi =>
        baseApi.get<IHomeAdsResponse>('/superadmin/ads/home')
    )

export const createHomeAd = async (data: FormData) =>
    await apiCall<IGeneric>(baseApi => baseApi.post<IGeneric>('/superadmin/ads/home', data, {
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
