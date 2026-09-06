import { create } from 'zustand';

export const useChatStore = create((set) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  groups: [],
  selectedGroup: null,
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
  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  setLoading: (loading) => set({ loading })
}));
