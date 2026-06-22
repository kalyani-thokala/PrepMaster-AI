import { create } from "zustand";
import apiClient from "../services/api.js";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("auth-user")) || null,
  isAuthenticated: !!localStorage.getItem("auth-user"),
  isLoading: false,
  error: null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem("auth-user", JSON.stringify(user));
      set({ user, isAuthenticated: true, error: null });
    } else {
      localStorage.removeItem("auth-user");
      set({ user: null, isAuthenticated: false });
    }
  },

  register: async (fullName, email, password, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/auth/register", {
        fullName,
        email,
        password,
        confirmPassword
      });
      set({ isLoading: false });
      return { success: true, data: response.data.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || "Registration failed";
      set({ isLoading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  login: async (email, password, rememberMe) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
        rememberMe
      });
      const { user } = response.data.data;
      localStorage.setItem("auth-user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data: user };
    } catch (err) {
      const errMsg = err.response?.data?.message || "Invalid credentials";
      set({ isLoading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout request error: ", err);
    } finally {
      localStorage.removeItem("auth-user");
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      const user = response.data.data;
      localStorage.setItem("auth-user", JSON.stringify(user));
      set({ user, isAuthenticated: true, error: null });
    } catch (err) {
      localStorage.removeItem("auth-user");
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put("/auth/profile", profileData);
      const user = response.data.data;
      localStorage.setItem("auth-user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true, data: user };
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update profile";
      set({ isLoading: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  }
}));
