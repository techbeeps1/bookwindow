import { baseApi } from "./baseApi";

interface User {
  id: string;
  name: string;
  email: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetMeQuery, useLazyGetMeQuery } = authApi;