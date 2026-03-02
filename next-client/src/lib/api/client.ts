"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Sends httpOnly cookies automatically
});

// Endpoints that should NOT trigger the refresh/redirect cycle
const AUTH_CHECK_PATHS = [
  "/auth/me",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/clear-session",
];

// Retry interceptor for transient failures (5xx, network errors)
const IDEMPOTENT_METHODS = ["get", "put", "delete", "head", "options"];
const MAX_RETRIES = 2;

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  if (!config) return Promise.reject(error);

  config._retryCount = config._retryCount || 0;
  const isIdempotent = IDEMPOTENT_METHODS.includes(
    (config.method || "").toLowerCase(),
  );
  const isRetryable =
    !error.response ||
    (error.response.status >= 500 && error.response.status < 600);

  if (isIdempotent && isRetryable && config._retryCount < MAX_RETRIES) {
    config._retryCount++;
    const delay = 300 * Math.pow(3, config._retryCount - 1); // 300ms, 900ms
    await new Promise((resolve) => setTimeout(resolve, delay));
    return api(config);
  }

  return Promise.reject(error);
});

// Response interceptor to handle token refresh via cookies
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestPath = originalRequest?.url || "";

    // Don't attempt refresh for auth-related endpoints (prevents loops)
    const isAuthEndpoint = AUTH_CHECK_PATHS.some((p) =>
      requestPath.includes(p),
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // Refresh uses httpOnly refreshToken cookie — server sets new accessToken cookie
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        // Retry original request; fresh accessToken cookie is now set
        return api(originalRequest);
      } catch (refreshError) {
        // Only redirect if not already on a public/auth page
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          const publicPaths = [
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/",
          ];
          const isPublicPage =
            publicPaths.includes(path) ||
            path.startsWith("/templates") ||
            path.startsWith("/services");
          if (!isPublicPage) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { getUploadUrl } from "@/lib/utils/uploadUrl";
