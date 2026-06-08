import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface Order {
  id: string;
  title: string;
  description: string;
  referenceImageUrl?: string;
  aiGeneratedImageUrl?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  customerId: string;
  customerName?: string;
  artisanName?: string;
  agreedPrice?: number;
  createdAt: string;
  updatedAt?: string;
  hasActiveReturn?: boolean;
}

export interface CreateOrderPayload {
  title: string;
  description: string;
  referenceImageUrl?: string;
  aiGeneratedImageUrl?: string;
}

export interface SketchEnhanceResponse {
  sketchUrl: string;
  aiGeneratedUrl: string;
}

export const ordersApi = {
  getMyOrders: () => api.get<Order[]>('/orders'),
  getAllPendingOrders: () => api.get<Order[]>('/orders/pending'),
  getOrderById: (id: string) => api.get<Order>(`/orders/${id}`),
  createOrder: (data: CreateOrderPayload) => api.post<Order>('/orders', data),
  completeOrder: (id: string) => api.post(`/orders/${id}/complete`),
  approveOrder: (id: string) => api.post(`/orders/${id}/approve`),
  getCustomerOrders: (customerId: string) =>
    api.get<Order[]>(`/orders/customer/${customerId}`),
  uploadSketch: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/orders/upload-sketch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  enhanceSketch: (
    sketch: File,
    category: string,
    dimensions: string,
    material: string
  ) => {
    const formData = new FormData();
    formData.append('sketch', sketch);
    formData.append('category', category);
    formData.append('dimensions', dimensions);
    formData.append('material', material);
    return api.post<SketchEnhanceResponse>('/orders/enhance-sketch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
};

export interface Quote {
  id: string;
  orderId: string;
  orderTitle?: string;
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
  getMyQuotes: () => api.get<Quote[]>('/quotes/my'),
  createQuote: (data: CreateQuotePayload) => api.post<Quote>('/quotes', data),
  acceptQuote: (quoteId: string) =>
    api.post(`/quotes/${quoteId}/accept`),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'HELD_IN_ESCROW' | 'RELEASED_TO_ARTISAN' | 'REFUNDED';
  createdAt: string;
}

export const paymentsApi = {
  getPaymentsByOrder: (orderId: string) =>
    api.get<Payment[]>(`/payments/${orderId}`),
  holdFunds: (orderId: string) =>
    api.post<Payment>(`/payments/${orderId}/hold`),
  getMyPayments: () => api.get<Payment[]>('/payments/my'),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface CreateReviewPayload {
  rating: number;
  comment: string;
}

export interface Review {
  id: string;
  orderId: string;
  artisanId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const reviewsApi = {
  createReview: (orderId: string, data: CreateReviewPayload) =>
    api.post(`/orders/${orderId}/reviews`, data),
  getReviewByOrder: (orderId: string) =>
    api.get<Review>(`/reviews/order/${orderId}`),
  getReviewsByArtisan: (artisanId: string) =>
    api.get<Review[]>(`/reviews/artisan/${artisanId}`),
  getArtisanStats: (artisanId: string) =>
    api.get<{ averageRating: number; reviewCount: number }>(`/reviews/artisan/${artisanId}/stats`),
};

// ─── Returns ──────────────────────────────────────────────────────────────────
export interface Return {
  id: string;
  orderId: string;
  orderTitle: string;
  artisanId: string;
  artisanName: string;
  customerId: string;
  customerName: string;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export const returnsApi = {
  createReturn: (orderId: string, reason: string) =>
    api.post<Return>(`/returns?orderId=${orderId}`, { reason }),
  approveReturn: (returnId: string) =>
    api.post(`/returns/${returnId}/approve`),
  rejectReturn: (returnId: string) =>
    api.post(`/returns/${returnId}/reject`),
  getMyReturns: () =>
    api.get<Return[]>('/returns/my'),
  getAllReturns: () =>
    api.get<Return[]>('/returns/my/all'),
  getReturnByOrder: (orderId: string) =>
    api.get<Return>(`/returns/order/${orderId}`),
};

// ─── Go Catalog & Portfolio Service ───────────────────────────────────────────
const CATALOG_URL = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://localhost:8081/api/v1';

const catalogHttp = axios.create({
  baseURL: CATALOG_URL,
  headers: { 'Content-Type': 'application/json' },
});

catalogHttp.interceptors.request.use(
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

export interface Portfolio {
  id: string;
  artisan_id: string;
  full_name: string;
  bio: string;
  profession: string;
  skills: string[];
  rating_sum: number;
  rating_count: number;
  items: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  order_id?: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  completed_at: string;
  rating: number;
  comment: string;
  is_manual: boolean;
}

export interface CatalogFeedItem {
  id: string;
  order_id?: string;
  artisan_id: string;
  artisan_name: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  completed_at: string;
  rating: number;
  comment: string;
  is_manual: boolean;
}

export const portfolioApi = {
  getPortfolio: (artisanId: string) =>
    catalogHttp.get<Portfolio>(`/portfolios/${artisanId}`),
  updatePortfolio: (data: { full_name: string; bio: string; profession: string; skills: string[] }) =>
    catalogHttp.post('/portfolios', data),
  createItem: (data: { title: string; description: string; image_url: string; price: number }) =>
    catalogHttp.post<PortfolioItem>('/portfolios/items', data),
};

export const catalogApi = {
  getFeed: () =>
    catalogHttp.get<CatalogFeedItem[]>('/catalog'),
};

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  orderId?: string;
  isRead: boolean;
}

export interface Conversation {
  counterPartyId: string;
  counterPartyName: string;
  lastMessage: string;
  lastTimestamp: string;
  lastOrderId?: string;
  unreadCount: number;
}

export const chatApi = {
  getConversations: () =>
    catalogHttp.get<Conversation[]>('/chat/conversations'),
  getChatHistory: (otherUserId: string) =>
    catalogHttp.get<ChatMessage[]>(`/chat/history?otherUserId=${otherUserId}`),
};

export default api;
