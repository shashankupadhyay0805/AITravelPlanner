import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = { id: string; name: string; email: string; avatarUrl?: string; bio?: string };

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: "trao-auth" },
  ),
);

