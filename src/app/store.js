// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../redux/api/baseApi";
import authReducer from "../redux/features/auth/authSlice";


export const store = configureStore({

  reducer: {

    [baseApi.reducerPath]: baseApi.reducer,

    auth: authReducer,

  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),

});