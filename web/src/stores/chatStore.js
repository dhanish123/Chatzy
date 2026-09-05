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
    // Insert message maintaining OLDEST FIRST order
    // So when rendered: oldest at top, newest at bottom
    const newMessages = [...state.messages];
    const messageTime = new Date(message.createdAt).getTime();
    
    // Find position: insert before first message that's newer
    let insertIndex = newMessages.length;
    for (let i = 0; i < newMessages.length; i++) {
      const existingTime = new Date(newMessages[i].createdAt).getTime();
      if (messageTime < existingTime) {  // If new message is OLDER, insert before
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
