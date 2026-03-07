import type {
      OAuthApp,
      OAuthAppListItem,
      RegenerateSecretResult,
      CreateOAuthAppRequest,
      UpdateOAuthAppRequest,
} from "../entities/OAuthApp";

export interface IOAuthAppRepository {
      getAll(params: {
            page: number;
            pageSize: number;
            search?: string;
      }): Promise<{ items: OAuthAppListItem[]; totalCount: number }>;

      getById(id: string): Promise<OAuthApp>;

      create(data: CreateOAuthAppRequest): Promise<OAuthApp>;

      update(id: string, data: UpdateOAuthAppRequest): Promise<void>;

      remove(id: string): Promise<void>;

      regenerateSecret(id: string): Promise<RegenerateSecretResult>;
}
