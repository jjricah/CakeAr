import { Platform } from 'react-native';

// API Base URL - Update this with your actual backend URL
const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'ios') {
      return 'http://localhost:5001/api';
    } else {
      // Android emulator uses 10.0.2.2 to access localhost
      return 'http://10.0.2.2:5001/api';
    }
  }
  // Production mode - replace with your production API URL
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getBaseUrl();

// API Helper function
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
};

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => {
  return authToken;
};

export const apiRequestWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();
  
  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};
