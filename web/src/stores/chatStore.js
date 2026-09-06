import { create } from 'zustand';

export const useChatStore = create((set) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  loading: false,

  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    // Just append new messages to the end
    // They will be reversed during rendering
    return { messages: [...state.messages, message] };
  }),
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m._id === messageId ? { ...m, ...updates } : m))
    })),
  setLoading: (loading) => set({ loading })
}));
