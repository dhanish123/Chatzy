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
  // Get user state - disabled for now
  getState: async () => {
    return { data: {} };
  },

  // Set selected conversation - disabled for now
  setSelectedConversation: () => {
    // No-op
  },

  // Set selected group - disabled for now
  setSelectedGroup: () => {
    // No-op
  },

  // Clear user state - disabled for now
  clearState: () => {
    // No-op
  }
};
