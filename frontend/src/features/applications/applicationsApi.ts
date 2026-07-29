import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const applicationsApi = createApi({
  reducerPath: "applicationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("dangila_accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Application"],
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: (params) => `/applications?${new URLSearchParams(params)}`,
      providesTags: ["Application"],
    }),
    getApplicationById: builder.query({
      query: (id) => `/applications/${id}`,
      providesTags: (result, error, id) => [{ type: "Application", id }],
    }),
    createApplication: builder.mutation({
      query: (body) => ({ url: "/applications", method: "POST", body }),
      invalidatesTags: ["Application"],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/applications/${id}/status`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Application", id }],
    }),
  }),
});
