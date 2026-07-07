import { baseApi } from "./baseApi";

export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getMenu: builder.query<any, void>({
  query: () => "/menus/header_menu",
   providesTags: ["Menu"],
   }),

 
  }),
});

export const {
  useGetMenuQuery,
  useLazyGetMenuQuery,

} = menuApi;