import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const CORE_BASE_URL = 'http://18.192.48.116:8080/api/v1';

const api = axios.create({
  baseURL: CORE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('aynisindan_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'ARTISAN';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  userId: string;
  fullName: string;
  email: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data),
};

export default api;
