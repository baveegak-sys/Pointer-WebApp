import { baseApi } from "../../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: body => ({
        url: "/users/login",
        method: "POST",
        body,
      }),
    }),

    verifyLoginOtp: builder.mutation({
      query: body => ({
        url: "/users/verify-login-otp",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyLoginOtpMutation,
  useLogoutMutation
} = authApi;