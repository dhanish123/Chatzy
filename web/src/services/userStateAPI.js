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
    console.error('User state API error:', error.message);
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
      console.error('Error fetching user state:', error);
      // Return empty state on error
      return { data: {} };
    }
  },

  // Set selected conversation
  setSelectedConversation: async (conversationId) => {
    try {
      const response = await axiosInstance.post('/conversation', { conversationId });
      return response;
    } catch (error) {
      console.error('Error setting selected conversation:', error);
      throw error;
    }
  },

  // Set selected group
  setSelectedGroup: async (groupId) => {
    try {
      const response = await axiosInstance.post('/group', { groupId });
      return response;
    } catch (error) {
      console.error('Error setting selected group:', error);
      throw error;
    }
  },

  // Clear user state
  clearState: async () => {
    try {
      const response = await axiosInstance.post('/clear');
      return response;
    } catch (error) {
      console.error('Error clearing user state:', error);
      throw error;
    }
  }
};
