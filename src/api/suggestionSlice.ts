import { IPagination, ISuggestionResponse, IUnreadSuggestionCountResponse } from "@/types/api/suggestion.types";
import { apiSlice } from "./apiSlice";
import { apiCall, } from "./auth.api";
import { IGeneric } from "@/types/api/auth.types";

export const suggestionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSuggestions: builder.query<ISuggestionResponse, IPagination>({
            query: (data) => {
                const authToken = localStorage.getItem("superadmin_token");
                return {
                    url: `superadmin/suggestions/all?limit=${data.limit}&page=${data.page}`,
                    method: "GET",
                    headers: {
                        "superadmin-auth": `${authToken}`,
                    },
                };
            },
        }),
        getUnreadSuggestionCount: builder.query<IUnreadSuggestionCountResponse, void>({
            query: () => {
                const authToken = localStorage.getItem("superadmin_token");
                return {
                    url: "superadmin/suggestions/unread-count",
                    method: "GET",
                    headers: { "superadmin-auth": `${authToken}` },
                };
            },
        }),
    }),
});

export const { useGetSuggestionsQuery, useGetUnreadSuggestionCountQuery } = suggestionApiSlice;

export const notifySuggestionCountChanged = () => {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("suggestions:changed"));
};

export const getSuggestions = async (data: IPagination) =>
    await apiCall<ISuggestionResponse>((baseApi) =>
        baseApi.get<ISuggestionResponse>(
            `superadmin/suggestions/all?limit=${data.limit}&page=${data.page}`
        )
    );

export const markAsRead = async (_id: string) => {
    const response = await apiCall<IGeneric>((baseApi) =>
        baseApi.put<IGeneric>(`/superadmin/suggestions/markread/${_id}`)
    );
    if (response.ok) notifySuggestionCountChanged();
    return response;
};

export const deleteSuggestion = async (_id: string) => {
    const response = await apiCall<IGeneric>((baseApi) =>
        baseApi.delete<IGeneric>(`/superadmin/suggestions/del/${_id}`)
    );
    if (response.ok) notifySuggestionCountChanged();
    return response;
};
