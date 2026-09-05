import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper to construct proper image URLs
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  // Remove /api from base URL to get domain
  const baseUrl = API_URL.replace('/api', '');
  
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data)
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/users/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getUser: (userId) => api.get(`/users/${userId}`),
  searchUsers: (q) => api.get('/users/search', { params: { q } })
};

export const friendAPI = {
  sendRequest: (receiverId) => api.post('/friends/requests', { receiverId }),
  acceptRequest: (requestId) => api.post(`/friends/requests/${requestId}/accept`),
  rejectRequest: (requestId) => api.post(`/friends/requests/${requestId}/reject`),
  cancelRequest: (requestId) => api.delete(`/friends/requests/${requestId}`),
  getPendingRequests: () => api.get('/friends/requests/pending'),
  getSentRequests: () => api.get('/friends/requests/sent'),
  getFriends: () => api.get('/friends')
};

export const blockAPI = {
  blockUser: (blockedId) => api.post('/blocks', { blockedId }),
  unblockUser: (blockedId) => api.delete(`/blocks/${blockedId}`),
  getBlockedUsers: () => api.get('/blocks'),
  isUserBlocked: (userId) => api.get(`/blocks/${userId}/check`)
};

export const conversationAPI = {
  getOrCreate: (otherUserId) => api.post('/conversations', { otherUserId }),
  getAll: () => api.get('/conversations'),
  get: (conversationId) => api.get(`/conversations/${conversationId}`),
  markAsRead: (conversationId) => api.put(`/conversations/${conversationId}/read`),
  clear: (conversationId) => api.delete(`/conversations/${conversationId}/clear`)
};

export const messageAPI = {
  getMessages: (conversationId, limit = 50, skip = 0) => 
    api.get(`/messages/${conversationId}`, { params: { limit, skip } }),
  send: (data) => api.post('/messages', data),
  edit: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
  delete: (messageId) => api.delete(`/messages/${messageId}`),
  markAsRead: (messageId) => api.post(`/messages/${messageId}/read`)
};

export const groupAPI = {
  create: (data) => api.post('/groups', data),
  getAll: () => api.get('/groups'),
  get: (groupId) => api.get(`/groups/${groupId}`),
  addMembers: (groupId, memberIds) => api.post(`/groups/${groupId}/members`, { memberIds }),
  makeAdmin: (groupId, memberId) => api.post(`/groups/${groupId}/members/${memberId}/admin`),
  removeAdmin: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}/admin`),
  removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
  leave: (groupId) => api.delete(`/groups/${groupId}/leave`),
  clear: (groupId) => api.delete(`/groups/${groupId}/clear`)
};

export const uploadAPI = {
  image: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  video: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  audio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  file: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export { userStateAPI } from './userStateAPI.js';

export default api;
