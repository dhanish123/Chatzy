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
    // Insert message in correct chronological order (by createdAt)
    const newMessages = [...state.messages];
    const messageTime = new Date(message.createdAt).getTime();
    
    // Find the correct position to insert the message
    let insertIndex = newMessages.length;
    for (let i = 0; i < newMessages.length; i++) {
      const existingTime = new Date(newMessages[i].createdAt).getTime();
      if (messageTime < existingTime) {
        insertIndex = i;
        break;
      }
    }
    
    newMessages.splice(insertIndex, 0, message);
    return { messages: newMessages };
  }),
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m._id === messageId ? { ...m, ...updates } : m))
    })),
  setLoading: (loading) => set({ loading })
}));
