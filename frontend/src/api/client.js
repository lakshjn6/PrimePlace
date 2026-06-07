import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Authentication
export const authAPI = {
  register: (data) => API.post('/auth/register/', data),
  login: (data) => API.post('/auth/login/', data),
  logout: () => API.post('/auth/logout/'),
  verifyEmail: (token) => API.get(`/auth/verify-email/?token=${token}`),
  resendVerification: (email) => API.post('/auth/resend-verification/', { email }),
  getProfile: () => API.get('/auth/profile/'),
  updateProfile: (data) => API.put('/auth/profile/', data),
  refreshToken: (refresh) => API.post('/token/refresh/', { refresh }),
};

// Store
export const storeAPI = {
  getCategories: () => API.get('/store/categories/'),
  getProducts: (params) => API.get('/store/products/', { params }),
  getProductBySlug: (slug) => API.get(`/store/products/${slug}/`),
};

// Cart
export const cartAPI = {
  getCart: () => API.get('/orders/cart/'),
  addToCart: (productId, quantity) => 
    API.post('/orders/cart/', { product: productId, quantity }),
  updateCart: (productId, quantity) => 
    API.put(`/orders/cart/${productId}/`, { quantity }),
  removeFromCart: (productId) => API.delete(`/orders/cart/${productId}/`),
};

// Orders
export const ordersAPI = {
  getOrders: () => API.get('/orders/'),
  checkout: (data) => API.post('/orders/checkout/', data),
};

// Interceptor to add JWT token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 errors (token expired)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refresh = localStorage.getItem('refresh_token');
        const newToken = await authAPI.refreshToken(refresh);
        
        localStorage.setItem('access_token', newToken.data.tokens.access);
        originalRequest.headers.Authorization = `Bearer ${newToken.data.tokens.access}`;
        
        return API(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;