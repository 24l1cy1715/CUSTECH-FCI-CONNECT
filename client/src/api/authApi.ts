import { useMutation } from '@tanstack/react-query';
import apiClient from './client';

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  resetToken?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

export const authApi = {
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>('/auth/forgot-password', payload);
    return data;
  },

  resendOtp: async (payload: ResendOtpPayload): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>('/auth/resend-otp', payload);
    return data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<ApiResponse & { resetToken: string }> => {
    const { data } = await apiClient.post<ApiResponse & { resetToken: string }>('/auth/verify-otp', payload);
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
    const { data } = await apiClient.post<ApiResponse>('/auth/reset-password', payload);
    return data;
  },
};

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
  });
}

export function useResendOtpMutation() {
  return useMutation({
    mutationFn: (payload: ResendOtpPayload) => authApi.resendOtp(payload),
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
  });
}
