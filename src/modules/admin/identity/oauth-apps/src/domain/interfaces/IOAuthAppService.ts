import type {
  OAuthAppJson,
  OAuthAppListResponseJson,
  CreateOAuthAppJson,
  CreateOAuthAppResponseJson,
  UpdateOAuthAppJson,
  RegenerateSecretResultJson,
} from "../types/OAuthAppTypes";

/**
 * Interface defining property specifications, keys types, and structural contract rules for service o auth app list params.
 */
export interface ServiceOAuthAppListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Http API network service for i o auth app.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IOAuthAppService {
  getAll(params: ServiceOAuthAppListParams): Promise<OAuthAppListResponseJson>;
  getById(id: string): Promise<OAuthAppJson>;
  create(data: CreateOAuthAppJson): Promise<CreateOAuthAppResponseJson>;
  update(id: string, data: UpdateOAuthAppJson): Promise<void>;
  remove(id: string): Promise<void>;
  regenerateSecret(id: string): Promise<RegenerateSecretResultJson>;
}
