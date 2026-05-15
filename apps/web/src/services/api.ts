import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('aynisindan_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aynisindan_token');
        localStorage.removeItem('aynisindan_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
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

// ─── Orders ──────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  title: string;
  description: string;
  referenceImageUrl?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  customerId: string;
  customerName?: string;
  artisanName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  title: string;
  description: string;
  referenceImageUrl?: string;
}

export const ordersApi = {
  getMyOrders: () => api.get<Order[]>('/orders'),
  getOrderById: (id: string) => api.get<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderPayload) => api.post<Order>('/orders', data),
  completeOrder: (id: string) => api.post(`/orders/${id}/complete`),
  approveOrder: (id: string) => api.post(`/orders/${id}/approve`),
  getCustomerOrders: (customerId: string) =>
    api.get<Order[]>(`/orders/customer/${customerId}`),
};

// ─── Quotes ──────────────────────────────────────────────────────────────────
export interface Quote {
  id: string;
  orderId: string;
  artisanId: string;
  artisanName: string;
  artisanRating?: number;
  artisanReviewCount?: number;
  artisanCity?: string;
  offeredPrice: number;
  estimatedDays: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface CreateQuotePayload {
  orderId: string;
  offeredPrice: number;
  estimatedDays: number;
  message?: string;
}

export const quotesApi = {
  getQuotesByOrder: (orderId: string) =>
    api.get<Quote[]>(`/quotes/order/${orderId}`),
  createQuote: (data: CreateQuotePayload) => api.post<Quote>('/quotes', data),
  acceptQuote: (quoteId: string) =>
    api.post(`/quotes/${quoteId}/accept`),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface CreateReviewPayload {
  rating: number;
  comment: string;
}

export const reviewsApi = {
  createReview: (orderId: string, data: CreateReviewPayload) =>
    api.post(`/orders/${orderId}/reviews`, data),
};

export default api;
