import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {

  session_id: string ;
  isAuthenticated: boolean;
  user:{
    id: string;
    name: string;
  },
  loading: boolean;
}

const initialState: AuthState = {

  session_id: "",
  isAuthenticated: false,
    user: {
    id: "",
    name: "",
  },
  loading: true
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    login: (state, action: PayloadAction< {user: { id: string; name: string } }>) => {

      state.user.id = action.payload.user.id;
      state.user.name = action.payload.user.name;
      state.isAuthenticated = true;
      state.loading = false;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user.id = "";
      state.user.name="";
      state.loading = false;
    },
    setUser: (state, action: PayloadAction<{ id: string; name: string}>) => {
      state.user.id = action.payload.id;
      state.user.name = action.payload.name;
      
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.session_id = action.payload;
    }
  },
});

export const { login, logout, setUser, setSessionId } = authSlice.actions;

export default authSlice.reducer;