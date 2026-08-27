import { baseApi } from "./baseApi";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

  viewCategory: builder.query<any, string>({
  query: (slug) => ({
    url: `/category/${slug}`,
  }),
  providesTags: ["Category"],
}),



  }),
});

export const {
  useLazyViewCategoryQuery,
  useViewCategoryQuery


} = categoryApi;