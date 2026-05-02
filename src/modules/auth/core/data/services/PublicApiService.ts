import type { IApiService } from "@core/interfaces/api.interface";

export class PublicApiService {
  constructor(private readonly api: IApiService) {}

  get<T>(endpoint: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    return this.api.getPublic<T>(endpoint, params, signal);
  }

  post<T>(endpoint: string, data?: unknown, signal?: AbortSignal): Promise<T> {
    return this.api.postPublic<T>(endpoint, data, signal);
  }
}

