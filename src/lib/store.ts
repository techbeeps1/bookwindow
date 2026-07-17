import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";

import uiReducer from "./slices/uiSlice";

// RTK Query
import { baseApi } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    ui: uiReducer,

    // RTK Query
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
devTools:false
 // devTools: process.env.NODE_ENV !== "production",
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
