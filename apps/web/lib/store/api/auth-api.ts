import { baseApi } from './base-api';

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  pendingEmail: string | null;
  emailVerifiedAt: string | null;
  role: string;
  createdAt: string;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type UpdateMyProfileRequest = {
  name?: string;
  email?: string;
};

type UpdateMyProfileResponse = {
  user: AuthUser;
  emailVerificationRequired: boolean;
  emailVerificationToken: string | null;
};

type ConfirmMyEmailRequest = {
  token: string;
};

type ConfirmMyEmailResponse = {
  user: AuthUser;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    me: builder.query<AuthUser, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    updateMyProfile: builder.mutation<UpdateMyProfileResponse, UpdateMyProfileRequest>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    confirmMyEmail: builder.mutation<ConfirmMyEmailResponse, ConfirmMyEmailRequest>({
      query: (body) => ({
        url: '/users/me/email/confirm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useMeQuery,
  useUpdateMyProfileMutation,
  useConfirmMyEmailMutation,
} = authApi;
export type { AuthResponse };
