import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/user-state`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userStateAPI = {
  // Get user state
  getState: async () => {
    const response = await axiosInstance.get('/');
    return response;
  },

  // Set selected conversation
  setSelectedConversation: async (conversationId) => {
    const response = await axiosInstance.post('/conversation', { conversationId });
    return response;
  },

  // Set selected group
  setSelectedGroup: async (groupId) => {
    const response = await axiosInstance.post('/group', { groupId });
    return response;
  },

  // Clear user state
  clearState: async () => {
    const response = await axiosInstance.post('/clear');
    return response;
  }
};
