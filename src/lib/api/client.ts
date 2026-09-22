import axios, { type AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const STORAGE_KEY = 'cgagames-auth';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 15000,
});

type StoredAuth = { state?: { accessToken?: string; refreshToken?: string } };

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

/** Reads the `exp` claim without verifying the signature — only used to decide whether to
 * proactively refresh, never for anything security-sensitive. */
function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string | null) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

/** Refreshes the access token, sharing the in-flight request across concurrent callers.
 * Used both proactively (request interceptor, before an expired token ever goes out) and
 * reactively (response interceptor, on an unexpected 401 from a hard-auth endpoint). Endpoints
 * that use optional auth (e.g. guest checkout) never 401 on a stale token — they just silently
 * treat the request as unauthenticated — so relying on 401 alone missed exactly that case. */
async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));
  }
  isRefreshing = true;
  try {
    const stored = readStoredAuth();
    const refreshToken = stored?.state?.refreshToken;
    if (!refreshToken) throw new Error('No refresh token');

    const { data } = await axios.post<{ data: { accessToken: string } }>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
    );
    const newToken = data.data.accessToken;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const updated = JSON.parse(raw) as { state?: Record<string, unknown> };
      if (updated.state) updated.state.accessToken = newToken;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    processQueue(null, newToken);
    return newToken;
  } catch (err) {
    processQueue(err, null);
    localStorage.removeItem(STORAGE_KEY);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/* ── Request interceptor: attach JWT, proactively refreshing if it's expired/near-expiry ──── */
apiClient.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config;

  const stored = readStoredAuth();
  let token = stored?.state?.accessToken;
  if (!token) return config;

  const expiresAt = getTokenExpiryMs(token);
  const isStale = expiresAt !== null && expiresAt - Date.now() < 10_000;
  if (isStale && stored?.state?.refreshToken) {
    try {
      token = (await refreshAccessToken()) ?? token;
    } catch {
      // Refresh failed — fall through and send the stale token; the response interceptor's
      // reactive 401 handling (or the endpoint's own optional-auth fallback) takes it from there.
    }
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Response interceptor: auto-refresh on 401 (covers hard-auth endpoints / clock skew) ──── */
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
