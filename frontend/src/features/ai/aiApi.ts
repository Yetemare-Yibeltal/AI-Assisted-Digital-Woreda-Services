import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/ai",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("dangila_accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    sendChatMessage: builder.mutation({
      query: (body) => ({ url: "/chat/message", method: "POST", body }),
    }),
    getRecommendations: builder.mutation({
      query: (body) => ({ url: "/recommendations", method: "POST", body }),
    }),
    getAiStatus: builder.query({
      query: () => "/status",
    }),
  }),
});

export const {
  useSendChatMessageMutation,
  useGetRecommendationsMutation,
  useGetAiStatusQuery,
} = aiApi;
