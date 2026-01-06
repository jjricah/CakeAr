import { apiRequest, setAuthToken } from './api';
import { LoginResponse, RegisterData, LoginData } from '../types/auth';

export const authService = {
  // Register a new user
  register: async (userData: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.token) {
        setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials: LoginData): Promise<LoginResponse> => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      console.log('Login response:', response);

      if (response.token) {
        setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    setAuthToken(null);
  },
};
