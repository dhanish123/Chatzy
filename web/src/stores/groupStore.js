import { create } from 'zustand';

export const useGroupStore = create((set) => ({
  groups: [],
  selectedGroup: null,
  loading: false,

  setGroups: (groups) => set({ groups }),
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g._id === groupId ? { ...g, ...updates } : g))
    })),
  removeGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g._id !== groupId)
    })),
  setLoading: (loading) => set({ loading })
}));
