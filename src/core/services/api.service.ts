'use client';

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig
} from 'axios';
import type { IApiService } from '../interfaces/api.interface';
import { appLogger } from '@core/common/logger';

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
  private tokenKey = 'auth-token';
  private refreshTokenKey = 'refresh-token';
  private refreshHandler: (() => Promise<string | null>) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    const normalizedBaseUrl = baseUrl.startsWith('http')
      ? baseUrl
      : `https://${baseUrl}`;

    // Authenticated instance
    this.axiosInstance = axios.create({
      baseURL: normalizedBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      withCredentials: true, // equivalent to credentials: 'include'
    });

    // Public instance (no auth interceptors)
    this.axiosPublic = axios.create({
      baseURL: normalizedBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          appLogger.auth('Token added to request');
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
            appLogger.auth('No refresh handler set, redirecting to login');
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
              appLogger.auth('Token refreshed successfully');
              // Retry queued requests
              this.failedQueue.forEach(({ resolve }) => resolve(newToken));
              this.failedQueue = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.axiosInstance(originalRequest);
            }

            // Refresh failed
            this.failedQueue.forEach(({ reject }) => reject(new Error('Token refresh failed')));
            this.failedQueue = [];
            this.handleUnauthorized();
            return Promise.reject(error);
          } catch (refreshError) {
            appLogger.auth('Token refresh failed:', refreshError);
            this.failedQueue.forEach(({ reject }) => reject(refreshError as Error));
            this.failedQueue = [];
            this.handleUnauthorized();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        // Log other errors
        const message = this.extractErrorMessage(error);
        appLogger.error(`API Error: ${message}`);
        return Promise.reject(new Error(message));
      }
    );

    // Public instance - just log requests
    this.axiosPublic.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        appLogger.api(`${config.method?.toUpperCase()} ${config.url} (public)`);
        return config;
      }
    );

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
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Network error - please check your connection';
    }
    return error.message || 'Unknown error';
  }

  /**
   * Unwrap response data (handles { data: T } wrapper)
   */
  private unwrap<T>(data: unknown): T {
    if (data && typeof data === 'object' && 'data' in data) {
      const response = data as { data: T; pagination?: unknown; meta?: unknown };
      // Preserve full structure if it has pagination or meta
      if ('pagination' in response || 'meta' in response) {
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
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      appLogger.warn('Unauthorized - clearing tokens and redirecting');
      this.clearTokens();
      window.location.href = '/login';
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

  async get<T>(endpoint: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
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

  async getPublic<T>(endpoint: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const response = await this.axiosPublic.get(endpoint, this.buildConfig(signal, params));
    return this.unwrap<T>(response.data);
  }

  async postPublic<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.axiosPublic.post(endpoint, data, this.buildConfig(signal));
    return this.unwrap<T>(response.data);
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
      appLogger.api('204 response, fetching updated data...');
      const refreshUrl = refreshEndpoint || endpoint;
      return this.get<T>(refreshUrl, undefined, signal);
    }

    return response;
  }

  // ============================================
  // Token Management
  // ============================================

  setAuthToken(token: string | null): void {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(this.tokenKey, token);
        appLogger.auth('Token saved');
      } else {
        localStorage.removeItem(this.tokenKey);
        appLogger.auth('Token cleared');
      }
    }
  }

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      appLogger.auth('All tokens cleared');
    }
  }

  /**
   * Set the refresh handler for automatic token refresh
   */
  setRefreshHandler(handler: () => Promise<string | null>): void {
    this.refreshHandler = handler;
    appLogger.auth('Refresh handler set');
  }
}
