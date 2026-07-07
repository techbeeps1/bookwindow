import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  loading: boolean;

  mobileMenu: boolean;

  cartDrawer: boolean;

  searchModal: boolean;

  theme: "light" | "dark";

  language: string;

  currency: string;
}

const initialState: UIState = {
  loading: false,

  mobileMenu: false,

  cartDrawer: false,

  searchModal: false,

  theme: "light",

  language: "en",

  currency: "INR",
};

const uiSlice = createSlice({
  name: "ui",

  initialState,

  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    toggleMobileMenu: (state) => {
      state.mobileMenu = !state.mobileMenu;
    },

    closeMobileMenu: (state) => {
      state.mobileMenu = false;
    },

    openCartDrawer: (state) => {
      state.cartDrawer = true;
    },

    closeCartDrawer: (state) => {
      state.cartDrawer = false;
    },

    toggleSearchModal: (state) => {
      state.searchModal = !state.searchModal;
    },

    setTheme: (
      state,
      action: PayloadAction<"light" | "dark">
    ) => {
      state.theme = action.payload;
    },

    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
  },
});

export const {
  setLoading,
  toggleMobileMenu,
  closeMobileMenu,
  openCartDrawer,
  closeCartDrawer,
  toggleSearchModal,
  setTheme,
  setLanguage,
  setCurrency,
} = uiSlice.actions;

export default uiSlice.reducer;