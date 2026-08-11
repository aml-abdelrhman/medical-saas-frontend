import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/axiosInstance";
import { useAuthStore, type AuthUser } from "@/stores/useAuthStore";
import { AxiosError } from "axios";

interface LaravelValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  clinic_slug?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role?: "admin" | "patient" | "doctor" | "super_admin";
  clinic_id?: number;
}

export const useRegister = () => {
  return useMutation<AuthResponse, AxiosError<LaravelValidationError>, RegisterData>({
    mutationFn: (userData) => api.post("/register", userData).then((res) => res.data),
    onSuccess: (data) => {
      // استخدام setAuth المحدثة لتخزين بيانات المستخدم والتوكن وتفعيل الحالة
      useAuthStore.getState().setAuth(data.user, data.token);
      useAuthStore.getState().clearError();
    },
    onError: (error) => {
      const message = error.response?.data?.message || "حدث خطأ أثناء التسجيل";
      useAuthStore.getState().setError(message);
    },
  });
};

export const useLogin = () => {
  return useMutation<AuthResponse, AxiosError<LaravelValidationError>, LoginCredentials>({
    mutationFn: (credentials) => api.post("/login", credentials).then((res) => res.data),
    onSuccess: (data) => {
      // استخدام setAuth المحدثة لتخزين بيانات المستخدم والتوكن وتفعيل الحالة
      useAuthStore.getState().setAuth(data.user, data.token);
      useAuthStore.getState().clearError();
    },
    onError: (error) => {
      const message = error.response?.data?.message || "بيانات الدخول غير صحيحة";
      useAuthStore.getState().setError(message);
    },
  });
};