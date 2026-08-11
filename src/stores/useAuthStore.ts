import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "patient" | "doctor" | "super_admin" | string;
  avatar?: string;
  clinic_id?: number;
  clinic?: {
    id: number;
    name: string;
    slug?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        }),

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      logout: () => {
        // تنظيف الـ localStorage فوراً لمنع أي تعارض
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("telehealth-auth");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "telehealth-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const selectUser = (s: AuthState) => s.user;
export const selectToken = (s: AuthState) => s.token;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectAuthLoading = (s: AuthState) => s.isLoading;
export const selectAuthError = (s: AuthState) => s.error;

// عشان تقدر تنده على الـ store من الـ Console وانت بتعمل Debug
// (شغالة بس وقت التطوير - في الـ production build مش هتترندر خالص)
if (typeof window !== "undefined" && import.meta.env.DEV) {
  // @ts-expect-error - إضافة الـ store على الـ window عشان الـ debugging بس
  window.useAuthStore = useAuthStore;
}