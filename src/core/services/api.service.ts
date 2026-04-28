"use client";

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type { IApiService } from "../interfaces/api.interface";
import { appLogger } from "@core/common/logger";
import { secureTokenService } from "@core/common/secure-token-service";
import { authBroadcast } from "@core/common/broadcast-auth";
import { STORAGE_KEYS } from "../config/storage-keys";
import { DownloadInterceptedError, isExternalAbort } from "../errors/download-intercepted";

/**
 * Generate a UUID v4 string.
 * Uses crypto.randomUUID() when available (secure contexts / HTTPS),
 * falls back to crypto.getRandomValues() (available in ALL contexts).
 * Both paths are cryptographically secure.
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: manual UUID v4 via crypto.getRandomValues()
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * S0.15: Read a cookie value by name.
 * Used by CSRF double-submit cookie pattern to read XSRF-TOKEN.
 */
function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// P1.5: Cache language in module-level variable — avoids localStorage.getItem() on every request
let cachedLanguage: string = typeof window !== "undefined" ? localStorage.getItem("language") || "en" : "en";
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "language" && e.newValue) cachedLanguage = e.newValue;
  });
  // Also intercept direct writes from same tab
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key: string, value: string) {
    originalSetItem.call(this, key, value);
    if (key === "language") cachedLanguage = value;
  };
}

/**
 * API Service Implementation using Axios
 *
 * Enterprise-grade HTTP client with:
 * - Automatic token refresh on 401
 * - Request/Response interceptors
 * - Typed responses
 * - AbortController support
 */
export class ApiService implements IApiService {
  private axiosInstance: AxiosInstance;
  private axiosPublic: AxiosInstance;

  // private tokenKey = "auth-token"; // DEPRECATED: Use SecureTokenService
  // private refreshTokenKey = "refresh-token"; // DEPRECATED: Use SecureTokenService
  private refreshHandler: (() => Promise<string | null>) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
  }> = [];

  // Retry configuration
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000; // Base delay for exponential backoff
  private readonly retryableStatusCodes = [500, 502, 503, 504];

  // Tenant context for X-Tenant-Context header
  // Eagerly read from sessionStorage so the header is set BEFORE any React effects run.
  // Without this, TanStack Query fires dashboard queries during render (before useEffect),
  // and they go out without the tenant context header.
  private tenantContextId: string | null = (() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEYS.tenant_context);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.id) return parsed.id;
        }
      } catch {
        // Ignore parse errors
      }
    }
    return null;
  })();

  // Logout handler — set externally to avoid circular dependency
  // (ApiService cannot import useAppStore directly)
  private logoutHandler: (() => void) | null = null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    const normalizedBaseUrl = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

    // Authenticated instance
    this.axiosInstance = axios.create({
      baseURL: normalizedBaseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true, // equivalent to credentials: 'include'
    });

    // Public instance (no auth interceptors)
    this.axiosPublic = axios.create({
      baseURL: normalizedBaseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token and tenant context
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          appLogger.auth("Token added to request");
        }

        // Add tenant context header if set
        if (this.tenantContextId) {
          config.headers["X-Tenant-Context"] = this.tenantContextId;
          appLogger.api(`Tenant context: ${this.tenantContextId}`);
        }

        // P1.5: Use cached language instead of reading localStorage per request
        config.headers["Accept-Language"] = cachedLanguage;

        // P6.3: Request replay protection (timestamp + nonce)
        const isMutating = ["post", "put", "patch", "delete"].includes(
          (config.method ?? "").toLowerCase()
        );
        if (isMutating) {

          // Replay protection: unique timestamp + nonce per request
          config.headers["X-Request-Timestamp"] = Date.now().toString();
          config.headers["X-Request-Nonce"] = generateUUID();

          // S0.15: CSRF protection — double-submit cookie pattern
          // Read XSRF-TOKEN cookie and send as X-CSRF-Token header
          const csrfToken = getCookieValue("XSRF-TOKEN");
          if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
          }
        }

        // Fix for 415 Unsupported Media Type with FormData
        if (config.data instanceof FormData) {
          // Let browser set Content-Type with boundary
          delete config.headers["Content-Type"];
        }

        appLogger.api(`${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 and unwrap data
    this.axiosInstance.interceptors.response.use(
      (response) => {
        appLogger.api(`Success: ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Issue #8: DI timing race — if no refresh handler is wired yet,
          // just reject the promise instead of calling handleUnauthorized.
          // The route-guard will handle session restore.
          if (!this.refreshHandler) {
            appLogger.auth("No refresh handler set yet (DI timing race), rejecting request");
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            // Queue this request until refresh completes
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.axiosInstance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            this.refreshPromise = this.refreshHandler();
            const newToken = await this.refreshPromise;

            if (newToken) {
              appLogger.auth("Token refreshed successfully");
              // Retry queued requests
              this.failedQueue.forEach(({ resolve }) => resolve(newToken));
              this.failedQueue = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.axiosInstance(originalRequest);
            }

            // Refresh failed
            this.failedQueue.forEach(({ reject }) => reject(new Error("Token refresh failed")));
            this.failedQueue = [];
            this.handleUnauthorized();
            return Promise.reject(error);
          } catch (refreshError) {
            appLogger.auth("Token refresh failed:", refreshError);
            this.failedQueue.forEach(({ reject }) => reject(refreshError as Error));
            this.failedQueue = [];
            this.handleUnauthorized();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        // Global check: if IDM or another download manager intercepted the download,
        // we throw DownloadInterceptedError BEFORE the error gets mangled.
        if (isExternalAbort(error)) {
          return Promise.reject(new DownloadInterceptedError());
        }

        // Handle 403 TENANT_CONTEXT_FORBIDDEN - user lacks drill_down permission
        if (error.response?.status === 403) {
          const data = error.response.data as { error?: string; message?: string };
          if (data.error === "TENANT_CONTEXT_FORBIDDEN") {
            appLogger.warn("Tenant context forbidden - clearing context");
            // Clear the tenant context to exit drill-down mode (in-memory)
            this.setTenantContext(null);
            // Also clear sessionStorage so drill-down doesn't persist on refresh
            if (typeof window !== "undefined") {
              sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
            }
            // The error message will be shown to the user via the normal error flow
            return Promise.reject(
              new Error(data.message || "You do not have permission to switch tenant context")
            );
          }
        }

        // Log other errors
        const message = this.extractErrorMessage(error);
        appLogger.error(`API Error: ${message}`);
        const errObj = new Error(message) as any;
        errObj.details = error.response?.data;
        return Promise.reject(errObj);
      }
    );

    // Public instance - log requests and add Accept-Language
    this.axiosPublic.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // P1.5: Use cached language instead of reading localStorage per request
      config.headers["Accept-Language"] = cachedLanguage;

      appLogger.api(`${config.method?.toUpperCase()} ${config.url} (public)`);
      return config;
    });

    this.axiosPublic.interceptors.response.use(
      (response) => {
        appLogger.api(`Success: ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        // Global check: IDM interception
        if (isExternalAbort(error)) {
          return Promise.reject(new DownloadInterceptedError());
        }

        const message = this.extractErrorMessage(error);
        appLogger.error(`API Error: ${message}`);
        const errObj = new Error(message) as any;
        errObj.details = error.response?.data;
        return Promise.reject(errObj);
      }
    );
  }

  /**
   * Extract error message from Axios error
   */
  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as { message?: string; error?: string };
      return data.message || data.error || `HTTP ${error.response.status}`;
    }
    if (error.code === "ECONNABORTED") {
      return "Request timeout";
    }
    if (error.code === "ERR_NETWORK") {
      return "Network error - please check your connection";
    }
    return error.message || "Unknown error";
  }

  /**
   * Calculate delay for exponential backoff
   * @param attempt - Current retry attempt (0-indexed)
   * @returns Delay in milliseconds with jitter
   */
  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s... with random jitter
    const exponentialDelay = this.retryDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * 500; // Add 0-500ms jitter
    return exponentialDelay + jitter;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      return true; // Network errors are retryable
    }
    if (error.response?.status && this.retryableStatusCodes.includes(error.response.status)) {
      return true; // 5xx errors are retryable
    }
    return false;
  }

  /**
   * Sleep helper for retry delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute request with automatic retry on 5xx errors
   * Uses exponential backoff with jitter
   */
  private async withRetry<T>(
    requestFn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof AxiosError && this.isRetryableError(error)) {
          if (attempt < retries) {
            const delay = this.getRetryDelay(attempt);
            appLogger.warn(
              `Request failed, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${retries})`
            );
            await this.sleep(delay);
            continue;
          }
        }

        // Non-retryable error or max retries reached
        throw error;
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  /**
   * Unwrap response data (handles { data: T } wrapper)
   */
  private unwrap<T>(data: unknown): T {
    if (data && typeof data === "object" && "data" in data) {
      const response = data as { data: T; pagination?: unknown; meta?: unknown };
      // Preserve full structure if it has pagination or meta
      if ("pagination" in response || "meta" in response) {
        return data as T;
      }
      return response.data;
    }
    return data as T;
  }

  /**
   * Handle unauthorized - clear tokens and trigger store-based logout.
   * Uses Zustand store instead of window.location.href to preserve SPA state
   * and let RouteGuard handle the redirect.
   */
  private handleUnauthorized(): void {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      appLogger.warn("Unauthorized - clearing tokens and triggering store logout");
      this.clearTokens();
      // Broadcast to other tabs so they also log out
      authBroadcast.broadcastLogout();
      // Use the externally-set logout handler (wired by ServiceProvider)
      // This avoids circular dependency from require('@core/store/useAppStore')
      if (this.logoutHandler) {
        this.logoutHandler();
      }
    }
  }

  /**
   * Build config with AbortSignal
   */
  private buildConfig(signal?: AbortSignal, params?: Record<string, unknown>): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};
    if (signal) {
      config.signal = signal;
    }
    if (params) {
      config.params = params;
    }
    return config;
  }

  // ============================================
  // Authenticated Methods
  // ============================================

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<T> {
    const response = await this.axiosInstance.get(endpoint, this.buildConfig(signal, params));
    return this.unwrap<T>(response.data);
  }

  async getBlob(endpoint: string, signal?: AbortSignal): Promise<Blob> {
    try {
      const config: AxiosRequestConfig = { responseType: "blob" };
      if (signal) config.signal = signal;
      const response = await this.axiosInstance.get(endpoint, config);
      return response.data as Blob;
    } catch (error) {
      // Global detection: if the download was intercepted by an external
      // download manager (IDM, FDM, etc.), throw a typed error so callers
      // can treat it as success instead of failure.
      if (isExternalAbort(error)) {
        throw new DownloadInterceptedError();
      }
      throw error;
    }
  }

  async postBlob(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<Blob> {
    try {
      const config: AxiosRequestConfig = { responseType: "blob" };
      if (signal) config.signal = signal;
      const response = await this.axiosInstance.post(endpoint, data, config);
      return response.data as Blob;
    } catch (error) {
      if (isExternalAbort(error)) {
        throw new DownloadInterceptedError();
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.axiosInstance.post(endpoint, data, this.buildConfig(signal));
    return this.unwrap<T>(response.data);
  }

  async put<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.axiosInstance.put(endpoint, data, this.buildConfig(signal));
    return this.unwrap<T>(response.data);
  }

  async patch<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.axiosInstance.patch(endpoint, data, this.buildConfig(signal));
    return this.unwrap<T>(response.data);
  }

  async delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    const response = await this.axiosInstance.delete(endpoint, this.buildConfig(signal));
    return this.unwrap<T>(response.data);
  }

  // ============================================
  // Public Methods (No Auth)
  // ============================================

  async getPublic<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<T> {
    const response = await this.axiosPublic.get(endpoint, this.buildConfig(signal, params));
    return this.unwrap<T>(response.data);
  }

  async postPublic<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.axiosPublic.post(endpoint, data, this.buildConfig(signal));
    return this.unwrap<T>(response.data);
  }

  // ============================================
  // Retry-Enabled Methods (Auto-retry on 5xx)
  // ============================================

  /**
   * GET request with automatic retry on 5xx errors
   * Uses exponential backoff: 1s, 2s, 4s with jitter
   */
  async getWithRetry<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<T> {
    return this.withRetry(() => this.get<T>(endpoint, params, signal));
  }

  /**
   * POST request with automatic retry on 5xx errors
   */
  async postWithRetry<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    return this.withRetry(() => this.post<T>(endpoint, data, signal));
  }

  /**
   * PUT request with automatic retry on 5xx errors
   */
  async putWithRetry<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    return this.withRetry(() => this.put<T>(endpoint, data, signal));
  }

  // ============================================
  // Special Methods
  // ============================================

  async putWithRefresh<T>(
    endpoint: string,
    data?: unknown,
    refreshEndpoint?: string,
    signal?: AbortSignal
  ): Promise<T> {
    const response = await this.put<T>(endpoint, data, signal);

    // If 204 No Content, fetch updated data
    if (response === null) {
      appLogger.api("204 response, fetching updated data...");
      const refreshUrl = refreshEndpoint || endpoint;
      return this.get<T>(refreshUrl, undefined, signal);
    }

    return response;
  }

  // ============================================
  // Token Management
  // ============================================

  setAuthToken(token: string | null): void {
    if (typeof window !== "undefined") {
      if (token) {
        secureTokenService.setAccessToken(token);
        appLogger.auth("Token saved");
      } else {
        secureTokenService.clearTokens();
        appLogger.auth("Tokens cleared");
      }
    }
  }

  getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return secureTokenService.getAccessToken();
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== "undefined") {
      secureTokenService.clearTokens();
      appLogger.auth("All tokens cleared");
    }
  }

  /**
   * Set the refresh handler for automatic token refresh
   */
  setRefreshHandler(handler: () => Promise<string | null>): void {
    this.refreshHandler = handler;
    appLogger.auth("Refresh handler set");
  }

  /**
   * Set the logout handler called when auth is irrecoverably lost.
   * Wired by ServiceProvider to call useAppStore.getState().logout()
   * without circular dependency.
   */
  setLogoutHandler(handler: () => void): void {
    this.logoutHandler = handler;
    appLogger.auth("Logout handler set");
  }

  // ============================================
  // Tenant Context Management
  // ============================================

  /**
   * Set the current tenant context for X-Tenant-Context header
   * @param tenantId - The tenant ID to scope requests to, or null to clear
   */
  setTenantContext(tenantId: string | null): void {
    this.tenantContextId = tenantId;
    if (tenantId) {
      appLogger.api(`Tenant context set: ${tenantId}`);
    } else {
      appLogger.api("Tenant context cleared");
    }
  }

  /**
   * Get the current tenant context ID
   */
  getTenantContext(): string | null {
    return this.tenantContextId;
  }
}
