import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Authentication
export const authAPI = {
  register:           (data)    => API.post('/auth/register/', data),
  login:              (data)    => API.post('/auth/login/', data),
  logout:             ()        => API.post('/auth/logout/'),
  verifyEmail:        (token)   => API.get(`/auth/verify-email/?token=${token}`),
  resendVerification: (email)   => API.post('/auth/resend-verification/', { email }),
  getProfile:         ()        => API.get('/auth/profile/'),
  updateProfile:      (data)    => API.put('/auth/profile/', data),
  refreshToken:       (refresh) => API.post('/token/refresh/', { refresh }),
};

// Store
export const storeAPI = {
  getCategories:   ()       => API.get('/store/categories/'),
  getProducts:     (params) => API.get('/store/products/', { params }),
  getProductBySlug:(slug)   => API.get(`/store/products/${slug}/`),
  getProduct:      (slug)   => API.get(`/store/products/${slug}/`),  // alias used in ProductDetail
};

// Cart
export const cartAPI = {
  getCart:        ()                    => API.get('/orders/cart/'),
  addToCart:      (productId, quantity) => API.post('/orders/cart/', { product_id: productId, quantity }),
  updateCart:     (itemId, quantity)    => API.patch(`/orders/cart/${itemId}/`, { quantity }),
  removeFromCart: (itemId)              => API.delete(`/orders/cart/${itemId}/`),
  clearCart:      ()                    => API.delete('/orders/cart/'),
};

// Orders  ← checkout now accepts FormData automatically
export const ordersAPI = {
  getOrders: ()       => API.get('/orders/'),
  checkout:  (data)   => {
    // If FormData is passed (has screenshot), use multipart header
    const isFormData = data instanceof FormData;
    return API.post('/orders/checkout/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
};

// Interceptor — attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor — auto refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh  = localStorage.getItem('refresh_token');
        const newToken = await authAPI.refreshToken(refresh);
        localStorage.setItem('access_token', newToken.data.tokens.access);
        originalRequest.headers.Authorization = `Bearer ${newToken.data.tokens.access}`;
        return API(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;


