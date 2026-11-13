import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MAIN_API_BASE_URL } from "@/config/api";

const baseQuery = fetchBaseQuery({
  baseUrl: MAIN_API_BASE_URL,
});

export const apiSlice = createApi({
  baseQuery,
  endpoints: (builder) => ({}),
});
