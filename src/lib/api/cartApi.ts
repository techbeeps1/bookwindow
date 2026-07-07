import { baseApi } from "./baseApi";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    viewCart: builder.query({
      query: (sessionId: string) => ({
        url: "/cart/viewcart",
        params: {
          session_id: sessionId,
        },
      }),

      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation({
      query: (body) => ({
        url: "/cart/add",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Cart"],
    }),

    updateCart: builder.mutation({
      query: (body) => ({
        url: "/cart/cartupdate",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Cart"],
    }),

    removeCart: builder.mutation({
      query: (body) => ({
        url: "/cart/remove",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Cart"],
    }),

  }),
});

export const {
  useViewCartQuery,
  useLazyViewCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveCartMutation,
} = cartApi;