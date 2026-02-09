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
  private tenantContextId: string | null = null;

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
          if (!this.refreshHandler) {
            appLogger.auth("No refresh handler set, redirecting to login");
            this.handleUnauthorized();
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

        // Handle 403 TENANT_CONTEXT_FORBIDDEN - user lacks drill_down permission
        if (error.response?.status === 403) {
          const data = error.response.data as { error?: string; message?: string };
          if (data.error === "TENANT_CONTEXT_FORBIDDEN") {
            appLogger.warn("Tenant context forbidden - clearing context");
            // Clear the tenant context to exit drill-down mode (in-memory)
            this.setTenantContext(null);
            // Also clear sessionStorage so drill-down doesn't persist on refresh
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("tenant_context");
            }
            // The error message will be shown to the user via the normal error flow
            return Promise.reject(new Error(data.message || "You do not have permission to switch tenant context"));
          }
        }

        // Log other errors
        const message = this.extractErrorMessage(error);
        appLogger.error(`API Error: ${message}`);
        return Promise.reject(new Error(message));
      }
    );

    // Public instance - just log requests
    this.axiosPublic.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      appLogger.api(`${config.method?.toUpperCase()} ${config.url} (public)`);
      return config;
    });

    this.axiosPublic.interceptors.response.use(
      (response) => {
        appLogger.api(`Success: ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        const message = this.extractErrorMessage(error);
        appLogger.error(`API Error: ${message}`);
        return Promise.reject(new Error(message));
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
   * Handle unauthorized - clear tokens and redirect
   */
  private handleUnauthorized(): void {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      appLogger.warn("Unauthorized - clearing tokens and redirecting");
      this.clearTokens();
      window.location.href = "/login";
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
