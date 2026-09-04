import { create } from 'zustand';

export const useFriendStore = create((set) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  loading: false,

  setFriends: (friends) => set({ friends }),
  setPendingRequests: (requests) => set({ pendingRequests: requests }),
  setSentRequests: (requests) => set({ sentRequests: requests }),
  addFriend: (friend) => set((state) => ({ friends: [...state.friends, friend] })),
  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter((f) => f._id !== friendId)
    })),
  setLoading: (loading) => set({ loading })
}));
