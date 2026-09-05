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

// Add response error handler
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      // If user state not found, return empty object
      return { data: {} };
    }
    if (error.response?.status === 401) {
      // If unauthorized, just return empty
      return { data: {} };
    }
    // For other errors, re-throw
    return Promise.reject(error);
  }
);

export const userStateAPI = {
  // Get user state
  getState: async () => {
    try {
      const response = await axiosInstance.get('/');
      return response;
    } catch (error) {
      // Return empty state if any error occurs
      return { data: {} };
    }
  },

  // Set selected conversation
  setSelectedConversation: async (conversationId) => {
    try {
      const response = await axiosInstance.post('/conversation', { conversationId });
      return response;
    } catch (error) {
      // Silently fail for set operations
      return null;
    }
  },

  // Set selected group
  setSelectedGroup: async (groupId) => {
    try {
      const response = await axiosInstance.post('/group', { groupId });
      return response;
    } catch (error) {
      // Silently fail for set operations
      return null;
    }
  },

  // Clear user state
  clearState: async () => {
    try {
      const response = await axiosInstance.post('/clear');
      return response;
    } catch (error) {
      // Silently fail for clear operations
      return null;
    }
  }
};
