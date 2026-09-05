import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatStore = create(
  persist(
    (set) => ({
      conversations: [],
      selectedConversation: null,
      messages: [],
      loading: false,

      setConversations: (conversations) => set({ conversations }),
      setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (messageId, updates) =>
        set((state) => ({
          messages: state.messages.map((m) => (m._id === messageId ? { ...m, ...updates } : m))
        })),
      setLoading: (loading) => set({ loading })
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
        selectedConversation: state.selectedConversation
      })
    }
  )
);
