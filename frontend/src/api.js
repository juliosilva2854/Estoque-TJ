import axios from 'axios';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const api = axios.create({ baseURL: `${BACKEND_URL}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = {
  login: (c) => api.post('/auth/login', c),
  register: (d) => api.post('/auth/register', d),
  seed: () => api.post('/seed'),
};
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, d) => api.patch(`/users/${id}`, d),
  delete: (id) => api.delete(`/users/${id}`),
};
export const warehousesAPI = {
  getAll: () => api.get('/warehouses'),
  create: (d) => api.post('/warehouses', d),
  update: (id, d) => api.patch(`/warehouses/${id}`, d),
  delete: (id) => api.delete(`/warehouses/${id}`),
};
export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
  create: (d) => api.post('/suppliers', d),
  update: (id, d) => api.patch(`/suppliers/${id}`, d),
  delete: (id) => api.delete(`/suppliers/${id}`),
};
export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (d) => api.post('/products', d),
  update: (id, d) => api.patch(`/products/${id}`, d),
  delete: (id) => api.delete(`/products/${id}`),
  transfer: (id, warehouseId, qty) => api.post(`/products/${id}/transfer?warehouse_id=${warehouseId}&quantity=${qty}`),
};
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  adjust: (pid, wid, qty) => api.post(`/inventory/adjust?product_id=${pid}&warehouse_id=${wid}&quantity=${qty}`),
};
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  create: (d) => api.post('/invoices', d),
  processOCR: (b64) => api.post('/invoices/ocr', { image_base64: b64 }),
  uploadFile: (file) => { const fd = new FormData(); fd.append('file', file); return api.post('/invoices/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  processItems: (invoiceId, warehouseId) => api.post(`/invoices/${invoiceId}/process-items?warehouse_id=${warehouseId}`),
};
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAlerts: () => api.get('/dashboard/alerts'),
};
export const reportsAPI = {
  getFinancial: (p) => api.get(`/reports/financial?period=${p}`),
  exportPDF: (p) => api.get(`/reports/export/pdf?period=${p}`, { responseType: 'blob' }),
  exportExcel: (p) => api.get(`/reports/export/excel?period=${p}`, { responseType: 'blob' }),
  getABCCurve: () => api.get('/reports/abc-curve'),
  getInventoryTurnover: () => api.get('/reports/inventory-turnover'),
};
export const auditAPI = {
  getLogs: () => api.get('/audit'),
  exportExcel: () => api.get('/audit/export', { responseType: 'blob' }),
};
export const alertsAPI = {
  getConfigs: () => api.get('/alerts/config'),
  createConfig: (d) => api.post('/alerts/config', d),
  updateConfig: (id, d) => api.patch(`/alerts/config/${id}`, d),
  deleteConfig: (id) => api.delete(`/alerts/config/${id}`),
};
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};
export default api;
