import axios, { type AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const STORAGE_KEY = 'cgagames-admin-auth';

const adminClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

adminClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { state?: { accessToken?: string } };
        const token = parsed?.state?.accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch { /* ignore */ }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

adminClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
        return adminClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      if (typeof window === 'undefined') throw new Error('SSR context');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) throw new Error('No stored auth');
      const parsed = JSON.parse(stored) as { state?: { refreshToken?: string } };
      const refreshToken = parsed?.state?.refreshToken;
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post<{ data: { accessToken: string } }>(
        `${API_URL}/auth/refresh`,
        { refreshToken },
      );
      const newToken = data.data.accessToken;

      const updated = JSON.parse(stored) as { state?: Record<string, unknown> };
      if (updated.state) updated.state.accessToken = newToken;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      processQueue(null, newToken);
      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return adminClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined') window.location.href = '/admin/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default adminClient;
