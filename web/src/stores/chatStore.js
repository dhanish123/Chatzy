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
    // Add new messages at the BEGINNING of array
    // So when reversed for display, they appear at bottom
    return { messages: [message, ...state.messages] };
  }),
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m._id === messageId ? { ...m, ...updates } : m))
    })),
  setLoading: (loading) => set({ loading })
}));
