import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const adminBaseQuery = fetchBaseQuery({
  baseUrl: "/api", // Current domain
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const websiteBaseQuery = fetchBaseQuery({
  baseUrl: "https://admin.bookwindow.in/api",

  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

type CustomFetchArgs = FetchArgs & {
  admin?: boolean;
};

const dynamicBaseQuery: BaseQueryFn<
  string | CustomFetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const isAdmin =
    typeof args !== "string" && args.admin === true;

  if (isAdmin) {
    const { admin, ...rest } = args;
    return adminBaseQuery(rest, api, extraOptions);
  }

  return websiteBaseQuery(args, api, extraOptions);
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,

  tagTypes: [
    "Auth",
    "User",
    "Product",
    "Category",
    "Cart",
    "Order",
    "Wishlist",
    "Settings",
    "Menu",
    "products",
    "Publication",
  ],

  endpoints: () => ({}),
});
