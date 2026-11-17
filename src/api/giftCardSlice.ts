
import { IPagination } from "@/types/api/suggestion.types";
import { apiSlice } from "./apiSlice";
import { apiCall } from "./auth.api";
import { ICreateGiftCardResponse, IGiftCardResponse } from "@/types/api/giftCard.types";
import { IGeneric } from "@/types/api/auth.types";

export const giftCardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getGiftCards: builder.query<IGiftCardResponse, {pagination:IPagination, type:'RP'|'MERCHANT'}>({
            query: (data) => {
                const authToken = localStorage.getItem("superadmin_token");
                return {
                    url: `superadmin/giftcard/generated/fetch?type=${data.type}&limit=${data.pagination.limit}&page=${data.pagination.page}`,
                    method: "GET",
                    headers: {
                        "superadmin-auth": `${authToken}`,
                    },
                };
            },
        }),
    }),
});

export const { useGetGiftCardsQuery } = giftCardApiSlice;

export const getGiftCards = async (data: {pagination:IPagination, type:'RP'|'MERCHANT'}) =>
  await apiCall<IGiftCardResponse>((baseApi) =>
    baseApi.get<IGiftCardResponse>(
      `superadmin/giftcard/generated/fetch?type=${data.type}&limit=${data.pagination.limit}&page=${data.pagination.page}`
    )
  );

export const createGiftCard = async (data: {amount:string, currency:string}) =>
  await apiCall<ICreateGiftCardResponse>((baseApi) =>
    baseApi.post<ICreateGiftCardResponse>(
      `/superadmin/giftcard/generate/new`, 
      data,
    )
  );

export const activateGiftCard = async (data: {code:string, adminToken:string}) =>
  await apiCall<IGeneric>((baseApi) =>
    baseApi.put<IGeneric>(
      `/superadmin/giftcard/activate/${encodeURIComponent(data.code)}`,
      {authorizationCode: data.adminToken},
    )
  );

  export const deleteGiftCard = async (_id: string) =>
    await apiCall<IGeneric>((baseApi) =>
        baseApi.delete<IGeneric>(
            `superadmin/giftcard/${_id}`
        )
    );
