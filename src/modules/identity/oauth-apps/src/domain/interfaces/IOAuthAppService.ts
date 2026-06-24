import type {
  OAuthAppJson,
  OAuthAppListResponseJson,
  CreateOAuthAppJson,
  CreateOAuthAppResponseJson,
  UpdateOAuthAppJson,
  RegenerateSecretResultJson,
} from "../types/OAuthAppTypes";

/**
 * Interface structure detailing the properties and attributes of Service O Auth App List Params.
 */
export interface ServiceOAuthAppListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Interface defining operations for the OAuthApp network service.
 */
export interface IOAuthAppService {
  getAll(params: ServiceOAuthAppListParams): Promise<OAuthAppListResponseJson>;
  getById(id: string): Promise<OAuthAppJson>;
  create(data: CreateOAuthAppJson): Promise<CreateOAuthAppResponseJson>;
  update(id: string, data: UpdateOAuthAppJson): Promise<void>;
  remove(id: string): Promise<void>;
  regenerateSecret(id: string): Promise<RegenerateSecretResultJson>;
}
