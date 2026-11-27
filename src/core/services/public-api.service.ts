/**
 * PublicApiService — Unauthenticated HTTP client.
 *
 * Thin adapter over IApiService.getPublic / postPublic.
 * Satisfies IPublicApiService so any component that only needs
 * unauthenticated HTTP can depend on the narrow interface, not
 * the full IApiService.
 *
 * Registered in core/di.ts and exposed through ServiceProvider
 * as `publicApiService`.
 *
 * @module core/services
 */
import type { IApiService, MutationRequestOptions } from "@core/interfaces/api.interface";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";

export class PublicApiService implements IPublicApiService {
  constructor(private readonly api: IApiService) {}

  get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal,
    options?: MutationRequestOptions
  ): Promise<T> {
    return options
      ? this.api.getPublic<T>(endpoint, params, signal, options)
      : this.api.getPublic<T>(endpoint, params, signal);
  }

  post<T>(
    endpoint: string,
    data?: unknown,
    signal?: AbortSignal,
    options?: MutationRequestOptions
  ): Promise<T> {
    return options
      ? this.api.postPublic<T>(endpoint, data, signal, options)
      : this.api.postPublic<T>(endpoint, data, signal);
  }
}
