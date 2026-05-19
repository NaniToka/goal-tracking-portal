import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getStoredToken = () => localStorage.getItem('token');
const getStoredRefreshToken = () => localStorage.getItem('refreshToken');

const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('token', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

const isPublicAuthRequest = (config) => {
  const url = config?.url || '';
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/forgot-password')
  );
};

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

// Handle 401 — attempt token refresh once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isPublicAuthRequest(originalRequest)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      if (error.response?.status === 401) {
        clearTokens();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken || originalRequest.url?.includes('/auth/refresh')) {
      clearTokens();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const newToken = data.accessToken || data.token;
      setTokens(newToken, data.refreshToken);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  verify: () => api.post('/auth/verify'),
  changePassword: (payload) => api.put('/auth/change-password', payload),
  getSessions: () => api.get('/auth/sessions'),
};

export const goalsAPI = {
  getDashboard: (params) => api.get('/goals/dashboard', { params }),
  getMySheet: (params) => api.get('/goals/my-sheet', { params }),
  updateMySheet: (data) => api.put('/goals/my-sheet', data),
  submit: (data) => api.post('/goals/submit', data),
  updateAchievement: (data) => api.patch('/goals/achievement', data),
};

export const managerAPI = {
  getDashboard: (params) => api.get('/manager/dashboard', { params }),
  getTeam: () => api.get('/manager/team'),
  getTeamGoals: (params) => api.get('/manager/team-goals', { params }),
  approve: (sheetId) => api.put(`/manager/goals/${sheetId}/approve`),
  reject: (sheetId, reason) => api.put(`/manager/goals/${sheetId}/reject`, { reason }),
  rework: (sheetId, notes) => api.put(`/manager/goals/${sheetId}/rework`, { notes }),
  editGoals: (sheetId, goals) => api.put(`/manager/goals/${sheetId}/edit`, { goals }),
  addComment: (sheetId, data) => api.post(`/manager/goals/${sheetId}/comment`, data),
};

export const adminAPI = {
  getDashboard: (params) => api.get('/admin/dashboard', { params }),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/admin/users/${id}`),
  unlockSheet: (sheetId) => api.put(`/admin/goals/${sheetId}/unlock`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export const reportsAPI = {
  getAnalytics: (params) => api.get('/reports/analytics', { params }),
  exportReport: (params) =>
    api.get('/reports/export', { params, responseType: 'blob' }),
};

export const commonAPI = {
  getThrustAreas: () => api.get('/thrust-areas'),
};

export { setTokens, clearTokens, getStoredRefreshToken };
export default api;
