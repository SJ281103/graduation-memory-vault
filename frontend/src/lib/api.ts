import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Attach token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ── Memories ────────────────────────────────────────────────────────
export const submitMemory = (formData: FormData) =>
  api.post('/memories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getMemories = (params?: Record<string, unknown>) =>
  api.get('/memories', { params });

export const getMemoryStats = () => api.get('/memories/stats');

export const likeMemory = (id: string) => api.post(`/memories/${id}/like`);

export const commentMemory = (id: string, data: { text: string; authorName: string }) =>
  api.post(`/memories/${id}/comment`, data);

// ── Teachers ─────────────────────────────────────────────────────────
export const submitTeacherMemory = (formData: FormData) =>
  api.post('/teachers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getTeachers = () => api.get('/teachers');

// ── Guestbook ────────────────────────────────────────────────────────
export const signGuestbook = (data: Record<string, unknown>) => api.post('/guestbook', data);
export const getGuestbook  = () => api.get('/guestbook');

// ── Time Capsule ─────────────────────────────────────────────────────
export const submitCapsule = (data: Record<string, unknown>) => api.post('/capsule', data);
export const getCapsules   = () => api.get('/capsule');

// ── Admin ─────────────────────────────────────────────────────────────
export const adminLogin    = (creds: { username: string; password: string }) => api.post('/auth/login', creds);
export const verifyToken   = () => api.get('/auth/verify');
export const getAnalytics  = () => api.get('/admin/analytics');
export const exportData    = () => api.get('/admin/export');

export const adminGetMemories  = () => api.get('/memories/admin/all');
export const adminUpdateMemory = (id: string, data: Record<string, unknown>) => api.patch(`/memories/admin/${id}/status`, data);
export const adminDeleteMemory = (id: string) => api.delete(`/memories/admin/${id}`);

export const adminGetTeachers  = () => api.get('/teachers/admin/all');
export const adminUpdateTeacher = (id: string, data: Record<string, unknown>) => api.patch(`/teachers/admin/${id}/status`, data);
export const adminDeleteTeacher = (id: string) => api.delete(`/teachers/admin/${id}`);

export const adminGetCapsules  = () => api.get('/capsule/admin/all');
export const adminUpdateCapsule = (id: string, data: Record<string, unknown>) => api.patch(`/capsule/admin/${id}`, data);

export const adminGetGuestbook = () => api.get('/guestbook');
export const adminUpdateGuestbook = (id: string, data: Record<string, unknown>) => api.patch(`/guestbook/admin/${id}`, data);

export default api;
