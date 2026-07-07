import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  session_id: string ;
  isAuthenticated: boolean;
  user:{
    id: string;
    name: string;

  }
}

const initialState: AuthState = {
  token: null,
  session_id: "",
  isAuthenticated: false,
    user: {
    id: "",
    name: "",
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: { id: string; name: string } }>) => {
      state.token = action.payload.token;
      state.user.id = action.payload.user.id;
      state.user.name = action.payload.user.name;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
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