import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Solo limpiar sesión en 401 real desde el servidor (no en errores de red)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Solo redirigir al login si NO estamos en una página pública
      const publicPrefixes = ['/', '/inicio', '/login', '/ver-certificado', '/validar-certificado', '/activate'];
      const path = window.location.pathname;
      const isPublic = publicPrefixes.some(
        (p) => path === p || path.startsWith(p + '/')
      );
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;