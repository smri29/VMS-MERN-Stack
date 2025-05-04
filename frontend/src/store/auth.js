import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,           // { id, name, email }
  token: null,          // JWT string

  signup: async (name, email, password) => {
    const res = await fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const { success, data, message } = await res.json();
    if (success) {
      set({ user: data, token: data.token });
      localStorage.setItem("token", data.token);
    }
    return { success, message };
  },

  login: async (email, password) => {
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const { success, data, message } = await res.json();
    if (success) {
      set({ user: data, token: data.token });
      localStorage.setItem("token", data.token);
    }
    return { success, message };
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("token");
  },

  // Load from localStorage at startup
  rehydrate: () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optionally decode token or call /api/users/me to fetch user
      set({ token, user: null });
    }
  },
}));
