import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const totemApi = createApi({
  reducerPath: "totemApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/` 
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => "products",
      providesTags: ["Product"],
    }),
    addProduct: builder.mutation({
      query: (newProduct) => ({
        url: "products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const { useGetProductsQuery, useAddProductMutation } = totemApi;