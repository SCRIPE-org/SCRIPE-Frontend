/**
 * IPublicApiService Interface
 *
 * Contract for unauthenticated (public) HTTP operations.
 * No Bearer token, no CSRF, no replay protection headers.
 *
 * Use this for:
 * - Tenant resolution (white-label domain lookup)
 * - Login / register endpoints
 * - Account activation (token-based, pre-auth)
 * - SSO callbacks
 * - Any pre-authentication data fetch
 *
 * SOLID: Interface Segregation — callers that only need public HTTP
 * must not depend on the full IApiService contract.
 *
 * @module core/interfaces
 */
import type { MutationRequestOptions } from "./api.interface";

export interface IPublicApiService {
  /**
   * GET request without authentication headers.
   * @param endpoint - API endpoint path
   * @param params - Query parameters
   * @param signal - AbortSignal for cancellation
   * @param options - Optional request headers
   */
  get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal,
    options?: MutationRequestOptions
  ): Promise<T>;

  /**
   * POST request without authentication headers.
   * @param endpoint - API endpoint path
   * @param data - Request body
   * @param signal - AbortSignal for cancellation
   * @param options - Optional mutation options and request headers
   */
  post<T>(
    endpoint: string,
    data?: unknown,
    signal?: AbortSignal,
    options?: MutationRequestOptions
  ): Promise<T>;
}
