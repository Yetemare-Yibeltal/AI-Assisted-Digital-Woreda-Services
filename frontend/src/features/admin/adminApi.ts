import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { IAdmin } from "./adminTypes";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("dangila_accessToken");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    getAdmins: builder.query<IAdmin[], Record<string, any> | void>({
      query: (params) => `/admin?${new URLSearchParams(params || {})}`,
      providesTags: ["Admin"],
    }),
    getAdminById: builder.query<IAdmin, string>({
      query: (id) => `/admin/${id}`,
      providesTags: (result, error, id) => [{ type: "Admin", id }],
    }),
    createAdmin: builder.mutation<IAdmin, Partial<IAdmin>>({
      query: (body) => ({ url: "/admin", method: "POST", body }),
      invalidatesTags: ["Admin"],
    }),
    updateAdmin: builder.mutation<
      IAdmin,
      { id: string; data: Partial<IAdmin> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Admin", id }],
    }),
    toggleAdminStatus: builder.mutation<IAdmin, string>({
      query: (id) => ({ url: `/admin/${id}/toggle-status`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [{ type: "Admin", id }],
    }),
    updatePermissions: builder.mutation<
      IAdmin,
      { id: string; permissions: any }
    >({
      query: ({ id, permissions }) => ({
        url: `/admin/${id}/permissions`,
        method: "PATCH",
        body: { permissions },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Admin", id }],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useGetAdminByIdQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useToggleAdminStatusMutation,
  useUpdatePermissionsMutation,
} = adminApi;
