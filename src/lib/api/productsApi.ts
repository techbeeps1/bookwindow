import { baseApi } from "./baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    viewProducts: builder.query<any, void>({
      query: () => ({
        url: "/products",
    
      }),
      providesTags: ["products"],
    }),




  

  }),
});

export const {
  useLazyViewProductsQuery,
  useViewProductsQuery


} = productApi;