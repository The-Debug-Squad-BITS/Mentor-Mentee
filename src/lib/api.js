import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduflow_token') || 
    JSON.parse(localStorage.getItem('eduflow_auth') || '{}')?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401 received — auto logout and redirect to login (only if not already on the login page)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('eduflow_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
