import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, ActiveRole } from "@/types";
import { authApi, usersApi, setAuthToken } from "@/services/api";

interface AuthState {
  token: string | null;
  user: User | null;
  activeRole: ActiveRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  switchRole: (role: ActiveRole) => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      activeRole: "member",
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          setAuthToken(res.token);
          set({
            token: res.token,
            user: res.user,
            isAuthenticated: true,
            activeRole: res.user.roles.includes("admin")
              ? "admin"
              : res.user.roles.includes("staff")
                ? "staff"
                : res.user.roles.includes("merchant")
                  ? "merchant"
                  : "member",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          setAuthToken(res.token);
          set({
            token: res.token,
            user: res.user,
            isAuthenticated: true,
            activeRole: "member",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        setAuthToken(null);
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          activeRole: "member",
        });
      },

      switchRole: (role) => {
        const user = get().user;
        if (user && user.roles.includes(role)) {
          set({ activeRole: role });
        }
      },

      setUser: (user) => set({ user }),

      hydrate: () => {
        const token = get().token;
        if (token) setAuthToken(token);
      },
    }),
    {
      name: "easypoints-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeRole: state.activeRole,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token);
      },
    },
  ),
);
