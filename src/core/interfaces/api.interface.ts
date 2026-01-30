/**
 * IApiService Interface
 * Defines the contract for all API operations
 */
export interface IApiService {
      /**
       * GET request (authenticated)
       * @param endpoint - API endpoint
       * @param params - Query parameters
       * @param signal - AbortSignal for cancellation
       */
      get<T>(endpoint: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T>;

      /**
       * GET request (public - no auth token)
       * Use this for endpoints that don't require authentication
       * @param endpoint - API endpoint
       * @param params - Query parameters
       * @param signal - AbortSignal for cancellation
       */
      getPublic<T>(endpoint: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T>;

      /**
       * POST request (authenticated)
       * @param endpoint - API endpoint
       * @param data - Request body
       * @param signal - AbortSignal for cancellation
       */
      post<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T>;

      /**
       * POST request (public - no auth token)
       * Use this for endpoints that don't require authentication (e.g., login, register)
       * @param endpoint - API endpoint
       * @param data - Request body
       * @param signal - AbortSignal for cancellation
       */
      postPublic<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T>;

      /**
       * PUT request (authenticated)
       * @param endpoint - API endpoint
       * @param data - Request body
       * @param signal - AbortSignal for cancellation
       */
      put<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T>;

      /**
       * PATCH request (authenticated)
       * @param endpoint - API endpoint
       * @param data - Request body
       * @param signal - AbortSignal for cancellation
       */
      patch<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T>;

      /**
       * DELETE request (authenticated)
       * @param endpoint - API endpoint
       * @param signal - AbortSignal for cancellation
       */
      delete<T>(endpoint: string, signal?: AbortSignal): Promise<T>;

      /**
       * PUT with automatic refresh for 204 responses
       * @param endpoint - API endpoint
       * @param data - Request body
       * @param refreshEndpoint - Endpoint to fetch updated data
       * @param signal - AbortSignal for cancellation
       */
      putWithRefresh<T>(endpoint: string, data?: unknown, refreshEndpoint?: string, signal?: AbortSignal): Promise<T>;

      /**
       * Set the auth token
       * @param token - JWT token or null to clear
       */
      setAuthToken(token: string | null): void;

      /**
       * Get the current auth token
       */
      getAuthToken(): string | null;

      /**
       * Clear all auth tokens
       */
      clearTokens(): void;

      /**
       * Set token refresh handler
       * Called when access token is expired and needs refresh
       */
      setRefreshHandler(handler: () => Promise<string | null>): void;
}
