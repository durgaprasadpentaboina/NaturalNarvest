import axios from 'axios';

export const TOKEN_KEY = 'nh_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // An expired/invalid token on an authenticated call logs the user out everywhere
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login') && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new CustomEvent('nh:unauthorized'));
    }
    return Promise.reject(error);
  }
);

/** Turn any thrown error into a message that is safe and useful to show a shopper. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (error?.request && !error.response) return 'We cannot reach the server. Check your connection and try again.';
  return error?.message || fallback;
}

/** Field-level errors from the API: { email: 'Enter a valid email' } */
export function getFieldErrors(error) {
  const list = error?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  return list.reduce((acc, e) => (e.field && !acc[e.field] ? { ...acc, [e.field]: e.message } : acc), {});
}

export default api;
