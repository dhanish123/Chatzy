import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,
  typingUsers: {},
  onlineUsers: {},

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ isConnected: connected }),
  addTypingUser: (userId) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: true }
    })),
  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: false }
    })),
  setOnlineUsers: (users) => set({ onlineUsers: users })
}));
