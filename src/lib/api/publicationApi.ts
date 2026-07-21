import { baseApi } from "./baseApi";

export const publicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

  viewPublication: builder.query<any, string>({
  query: (slug) => ({
    url: `/publication/${slug}`,
  }),
  providesTags: ["Publication"],
}),



  }),
});

export const {
  useLazyViewPublicationQuery,
  useViewPublicationQuery


} = publicationApi;