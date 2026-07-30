import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { IService } from "./servicesTypes";
import type { PaginatedResponse } from "@/types/api.types";

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("dangila_accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Service"],
  endpoints: (builder) => ({
    getServices: builder.query<
      PaginatedResponse<IService>,
      Record<string, any> | void
    >({
      query: (params) =>
        `/services?${new URLSearchParams(params || {}).toString()}`,
      providesTags: ["Service"],
    }),
    getServiceById: builder.query<{ success: boolean; data: IService }, string>(
      {
        query: (id) => `/services/${id}`,
        providesTags: (result, error, id) => [{ type: "Service", id }],
      },
    ),
    createService: builder.mutation<
      { success: boolean; data: IService },
      Partial<IService>
    >({
      query: (body) => ({ url: "/services", method: "POST", body }),
      invalidatesTags: ["Service"],
    }),
    updateService: builder.mutation<
      { success: boolean; data: IService },
      { id: string; data: Partial<IService> }
    >({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Service", id }],
    }),
    deleteService: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/services/${id}`, method: "DELETE" }),
      invalidatesTags: ["Service"],
    }),
    toggleServiceStatus: builder.mutation<
      { success: boolean; data: IService },
      string
    >({
      query: (id) => ({ url: `/services/${id}/toggle`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [{ type: "Service", id }],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useToggleServiceStatusMutation,
} = servicesApi;
