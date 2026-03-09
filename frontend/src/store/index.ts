import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    orgId: string;
  } | null;
}

interface AppState extends AuthState {
  setAuth: (token: string, user: AuthState["user"]) => void;
  clearAuth: () => void;
}

export const useStore = create<AppState>((set) => ({
  isAuthenticated: !!localStorage.getItem("accessToken"),
  accessToken: localStorage.getItem("accessToken"),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem("accessToken", token);
    set({ isAuthenticated: true, accessToken: token, user });
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    set({ isAuthenticated: false, accessToken: null, user: null });
  },
}));
