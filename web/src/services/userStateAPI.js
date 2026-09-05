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
    if (error.response?.status === 404 || error.response?.status === 401) {
      // If user state not found or unauthorized, return empty object
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

  // Set selected conversation - fire and forget, don't report errors
  setSelectedConversation: async (conversationId) => {
    // Don't await or catch, just fire the request
    axiosInstance.post('/conversation', { conversationId }).catch(() => {
      // Silently ignore errors
    });
    return null;
  },

  // Set selected group - fire and forget, don't report errors
  setSelectedGroup: async (groupId) => {
    // Don't await or catch, just fire the request
    axiosInstance.post('/group', { groupId }).catch(() => {
      // Silently ignore errors
    });
    return null;
  },

  // Clear user state - fire and forget, don't report errors
  clearState: async () => {
    // Don't await or catch, just fire the request
    axiosInstance.post('/clear').catch(() => {
      // Silently ignore errors
    });
    return null;
  }
};
