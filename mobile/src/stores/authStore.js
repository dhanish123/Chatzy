import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      
      updateUserProfileImage: (profileImage) => set((state) => ({
        user: state.user ? { ...state.user, profileImage } : null
      })),
      
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'auth-storage',
      storage: AsyncStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);
