import type {
  OAuthApp,
  OAuthAppListItem,
  RegenerateSecretResult,
  CreateOAuthAppResponse,
  CreateOAuthAppRequest,
  UpdateOAuthAppRequest,
} from "../entities/OAuthApp";

/**
 * Repository layer implementing client request queries for i o auth app.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IOAuthAppRepository {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: OAuthAppListItem[]; totalCount: number }>;

  getById(id: string): Promise<OAuthApp>;

  create(data: CreateOAuthAppRequest): Promise<CreateOAuthAppResponse>;

  update(id: string, data: UpdateOAuthAppRequest): Promise<void>;

  remove(id: string): Promise<void>;

  regenerateSecret(id: string): Promise<RegenerateSecretResult>;
}
