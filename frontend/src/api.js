import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  seed: () => api.post('/seed'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const warehousesAPI = {
  getAll: () => api.get('/warehouses'),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.patch(`/warehouses/${id}`, data),
  delete: (id) => api.delete(`/warehouses/${id}`),
};

export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.patch(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  adjust: (productId, warehouseId, quantity) =>
    api.post(`/inventory/adjust?product_id=${productId}&warehouse_id=${warehouseId}&quantity=${quantity}`),
};

export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  create: (data) => api.post('/invoices', data),
  processOCR: (imageBase64) => api.post('/invoices/ocr', { image_base64: imageBase64 }),
};

export const salesAPI = {
  getAll: () => api.get('/sales'),
  create: (data) => api.post('/sales', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAlerts: () => api.get('/dashboard/alerts'),
};

export const reportsAPI = {
  getFinancial: (period) => api.get(`/reports/financial?period=${period}`),
};

export const auditAPI = {
  getLogs: () => api.get('/audit'),
};

export const alertsAPI = {
  getConfigs: () => api.get('/alerts/config'),
  createConfig: (data) => api.post('/alerts/config', data),
  updateConfig: (id, data) => api.patch(`/alerts/config/${id}`, data),
  deleteConfig: (id) => api.delete(`/alerts/config/${id}`),
  checkStock: () => api.post('/alerts/check-stock'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data),
};

export default api;
