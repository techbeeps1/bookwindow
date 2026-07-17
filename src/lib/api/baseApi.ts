import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const API_URL = "https://admin.bookwindow.in/api";

export const baseApi = createApi({
  reducerPath: "api",
  

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,

    prepareHeaders: (headers) => {

      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
 

      return headers;
    },
  }),

  tagTypes: [
    "Auth",
    "User",
    "Product",
    "Category",
    "Cart",
    "Order",
    "Wishlist",
    "Settings",
    'Menu',
    "products"
  ],

  endpoints: () => ({}),
});