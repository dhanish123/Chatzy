import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,
  typingUsers: {},
  recordingUsers: {},
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
  addRecordingUser: (userId) =>
    set((state) => ({
      recordingUsers: { ...state.recordingUsers, [userId]: true }
    })),
  removeRecordingUser: (userId) =>
    set((state) => ({
      recordingUsers: { ...state.recordingUsers, [userId]: false }
    })),
  setOnlineUsers: (users) => set({ onlineUsers: users })
}));
