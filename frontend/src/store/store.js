import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import { totemApi } from "./services/totemApi";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [totemApi.reducerPath]: totemApi.reducer, // Registers the RTK Query cache keys dynamically
  },
  // Senior requirement: Must include the api middleware for internal state caching cycles
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(totemApi.middleware),
});
