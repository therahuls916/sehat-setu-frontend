// src/utils/api.ts
import axios from 'axios';
import { auth } from './firebase'; // Import the auth instance from your firebase setup

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// --- THIS IS THE UPDATED, MORE ROBUST VERSION ---
apiClient.interceptors.request.use(
  async (config) => {
    // We make the interceptor async to wait for the token
    const user = auth.currentUser;

    if (user) {
      // If a user is logged in, get their ID token
      // Firebase SDK handles caching and refreshing this token automatically
      const token = await user.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;