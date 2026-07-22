import { baseApi } from "./baseApi";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    viewWishlist: builder.query<any, void>({
       query: () => ({
    url: "/my-account/view-wishlist",
    admin: true,
  }),
      
      providesTags: ["Wishlist"],
    }),

    viewWishlistId: builder.query<any, void>({
       query: () => ({
    url: "/my-account/view-wishlistid",
    admin: true,
  }),
      
      providesTags: ["Wishlist"],
    }),

    addToWishlist: builder.mutation({
      query: (product_id: any) => ({
        url: "/my-account/add-wishlist",
        method: "POST",
        admin: true,
        body: {
          product_id: product_id,
        },
      }),
      invalidatesTags: ["Wishlist"],
    }),



    removeWishlist: builder.mutation({
      query: (product_id: any) => ({
        url: "/my-account/delete-wishlist",
        method: "DELETE",
        admin: true,
        body: {
          product_id: product_id,
        },
      }),

      invalidatesTags: ["Wishlist"],
    }),

  }),
});

export const {
  useViewWishlistIdQuery,
  useLazyViewWishlistIdQuery,
  useViewWishlistQuery,
  useLazyViewWishlistQuery,
  useAddToWishlistMutation,
  useRemoveWishlistMutation,
  
} = wishlistApi;