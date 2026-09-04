import { create } from 'zustand';

export const useBlockStore = create((set) => ({
  blockedUsers: [],
  loading: false,

  setBlockedUsers: (users) => set({ blockedUsers: users }),
  addBlockedUser: (user) => set((state) => ({ blockedUsers: [...state.blockedUsers, user] })),
  removeBlockedUser: (userId) =>
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((u) => u._id !== userId)
    })),
  setLoading: (loading) => set({ loading })
}));
