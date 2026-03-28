import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          set({ user: res.data.data.user, accessToken: res.data.accessToken, isLoading: false });
          return res.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          set({ user: res.data.data.user, accessToken: res.data.accessToken, isLoading: false });
          return res.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async (localOnly = false) => {
        set({ isLoading: true });
        try {
          if (!localOnly) {
            await api.post('/auth/logout');
          }
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          set({ user: null, accessToken: null, isLoading: false });
        }
      },

      checkAuth: async () => {
        try {
          // Just verifying token is valid
          const res = await api.get('/auth/me');
          set({ user: res.data.data.user });
        } catch (error) {
          console.log("Not authenticated on check");
        }
      }
    }),
    {
      name: 'furnihub-auth',
      partialize: (state) => ({ user: state.user }), // ONLY persist user, not tokens
    }
  )
);
