import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  // Without this a dropped backend leaves requests pending forever and the UI
  // sits on a skeleton with no way to recover.
  timeout: 20000,
});

/**
 * Read the persisted session. Wrapped because a half-written or hand-edited
 * localStorage entry makes JSON.parse throw — and thrown from an interceptor
 * that would break *every* request, not just this one.
 */
function readToken() {
  const direct = localStorage.getItem('eduflow_token');
  if (direct) return direct;
  try {
    return JSON.parse(localStorage.getItem('eduflow_auth') || '{}')?.state?.token || null;
  } catch {
    localStorage.removeItem('eduflow_auth');
    return null;
  }
}

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * A human-readable message for any axios failure, so screens can surface one
 * line instead of each re-deriving it from error.response?.data?.message.
 * Attached as `error.userMessage`.
 */
function describe(error) {
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  const { status, data } = error.response;
  if (data?.message) return data.message;
  if (status === 400) return 'Some of the details are invalid. Please check and try again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'That item no longer exists.';
  if (status === 409) return 'That conflicts with something that already exists.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The server hit an error. Please try again shortly.';
  return 'Something went wrong. Please try again.';
}

// If 401 received — auto logout and redirect to login (only if not already on the login page)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = describe(error);

    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('eduflow_auth');
      localStorage.removeItem('eduflow_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
