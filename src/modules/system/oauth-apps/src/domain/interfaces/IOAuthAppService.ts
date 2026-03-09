import type {
      OAuthAppJson,
      OAuthAppListResponseJson,
      CreateOAuthAppJson,
      CreateOAuthAppResponseJson,
      UpdateOAuthAppJson,
      RegenerateSecretResultJson,
} from "../../data/models/OAuthAppModel";

export interface ServiceOAuthAppListParams {
      page?: number;
      pageSize?: number;
      search?: string;
}

export interface IOAuthAppService {
      getAll(params: ServiceOAuthAppListParams): Promise<OAuthAppListResponseJson>;
      getById(id: string): Promise<OAuthAppJson>;
      create(data: CreateOAuthAppJson): Promise<CreateOAuthAppResponseJson>;
      update(id: string, data: UpdateOAuthAppJson): Promise<void>;
      remove(id: string): Promise<void>;
      regenerateSecret(id: string): Promise<RegenerateSecretResultJson>;
}
