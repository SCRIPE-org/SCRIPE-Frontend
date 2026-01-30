import { handleError, getUserFriendlyErrorMessage } from "@core/common/error-handler";
import { appLogger } from "@core/common/logger";
import { secureTokenService } from "@core/common/secure-token-service";
import { toast } from "sonner";

export interface IApiService {
  get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<T>;
  post<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  put<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T>;
  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T>;
  putWithRefresh<T>(endpoint: string, data?: any, refreshEndpoint?: string, signal?: AbortSignal): Promise<T>;
}

export class ApiService implements IApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private buildUrl(endpoint: string) {
    const baseUrl = this.baseUrl.startsWith("http") ? this.baseUrl : `https://${this.baseUrl}`;
    return `${baseUrl}${endpoint}`;
  }

  private unwrap<T>(json: any): T {
    if (json && typeof json === "object" && "data" in json) {
      if ("pagination" in json) {
        return { data: json.data, pagination: json.pagination } as T;
      }
      return json.data as T;
    }
    return json as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, signal?: AbortSignal): Promise<T> {
    const url = this.buildUrl(endpoint);

    // Only log in development
    appLogger.api("Request:", { method: options.method || "GET", url });

    // Check if request was aborted before making the request
    if (signal?.aborted) {
      const error = new Error('Request was aborted');
      const appError = handleError(error, `API Request: ${url}`);
      toast.error(getUserFriendlyErrorMessage(appError));
      throw error;
    }

    const token = secureTokenService.getAccessToken();
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      // Only log token info in development mode
      if (process.env.NODE_ENV === 'development') {
        appLogger.api("Token added to request:", token.substring(0, 20) + "...");
      } else {
        appLogger.api("Request authenticated");
      }
    } else {
      appLogger.warn("No access token found");
    }

    const config: RequestInit = {
      ...options,
      headers,
      mode: "cors",
      signal, // Add abort signal
    };

    try {
      const response = await fetch(url, config);

      // Check if request was aborted after response
      if (signal?.aborted) {
        const error = new Error('Request was aborted');
        const appError = handleError(error, `API Response: ${url}`);
        toast.error(getUserFriendlyErrorMessage(appError));
        throw error;
      }

      appLogger.api("Response:", { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        if (response.status === 401) {
          if (window.location.pathname != "/login") {
            const error = new Error("Unauthorized - please login again");
            const appError = handleError(error, `API Request: ${url}`);
            toast.error(getUserFriendlyErrorMessage(appError));
            secureTokenService.clearTokens();
            // Use Next.js router instead of direct window manipulation
            if (typeof window !== 'undefined') {
              window.location.href = "/login";
            }
            throw error;
          } else {
            const error = new Error(response.statusText);
            const appError = handleError(error, `API Request: ${url}`);
            toast.error(getUserFriendlyErrorMessage(appError));
            throw error;
          }
        }
        const errorText = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        const appError = handleError(error, `API Request: ${url}`);
        toast.error(getUserFriendlyErrorMessage(appError));
        throw error;
      }

      if (response.status === 204) {
        appLogger.api("Success: 204 No Content");
        return null as T;
      }

      const json = await response.json();
      appLogger.api("Success (raw):", json);
      const unwrapped = this.unwrap<T>(json);
      appLogger.api("Success (unwrapped):", unwrapped);
      return unwrapped;
    } catch (error) {
      // Handle abort errors specifically
      if (error instanceof Error && error.name === 'AbortError') {
        appLogger.api("Request aborted:", url);
        const abortError = new Error('Request was aborted');
        const appError = handleError(abortError, `API Request: ${url}`);
        toast.error(getUserFriendlyErrorMessage(appError));
        throw abortError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError = new Error("Network error");
        const appError = handleError(networkError, `API Request: ${url}`);
        toast.error(getUserFriendlyErrorMessage(appError));
        throw networkError;
      }

      // Handle other errors
      const appError = handleError(error as Error, `API Request: ${url}`);
      toast.error(getUserFriendlyErrorMessage(appError));
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>, signal?: AbortSignal): Promise<T> {
    const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>(`${endpoint}${queryString}`, { method: "GET" }, signal);
  }

  async post<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }, signal);
  }

  async put<T>(endpoint: string, data?: any, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }, signal);
  }

  async delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, signal);
  }

  /**
   * PUT request with automatic refresh for 200 and 204 responses
   * - 200: Returns the response data directly
   * - 204: Automatically fetches the updated data
   * @param endpoint - The PUT endpoint
   * @param data - The data to send
   * @param refreshEndpoint - The endpoint to fetch updated data (optional, defaults to GET on same endpoint)
   * @param signal - Abort signal
   * @returns The updated data
   */
  async putWithRefresh<T>(endpoint: string, data?: any, refreshEndpoint?: string, signal?: AbortSignal): Promise<T> {
    const response = await this.put<any>(endpoint, data, signal);

    // If response is null (204 No Content), fetch the updated data
    if (response === null) {
      appLogger.api("204 response detected, fetching updated data...");
      const refreshUrl = refreshEndpoint || endpoint.replace(/\/Put$/, '').replace(/\/Put\/.*$/, '');
      return this.get<T>(refreshUrl, undefined, signal);
    }

    // If response has data (200 OK), return it directly
    appLogger.api("200 response detected, returning response data directly");
    return response;
  }
}
