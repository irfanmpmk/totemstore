import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("totem_token") || null,
  user: JSON.parse(localStorage.getItem("totem_user")) || null,
  isAuthenticated: !!localStorage.getItem("totem_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      localStorage.setItem("totem_token", token);
      localStorage.setItem("totem_user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("totem_token");
      localStorage.removeItem("totem_user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
