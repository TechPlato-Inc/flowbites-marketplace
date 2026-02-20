'use client';

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getUploadUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Handle "images/https://..." or "shots/https://..." from components that prepend a folder
  const stripped = path.replace(/^(images|shots|gallery)\//, '');
  if (stripped.startsWith('http')) return stripped;
  const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || '/uploads';
  return `${UPLOADS_URL}/${path}`;
};
