import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './menuSlice';
import cartReducer from './cartSlice'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    menu: menuReducer, // Registramos el slice
    cart: cartReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});