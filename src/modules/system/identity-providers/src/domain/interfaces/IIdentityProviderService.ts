import type {
      IdentityProviderJson,
      IdentityProviderListResponseJson,
      CreateIdentityProviderJson,
      UpdateIdentityProviderJson,
      TestConnectionResultJson,
} from "../types/IdentityProviderTypes";

export interface ServiceIdentityProviderListParams {
      page?: number;
      pageSize?: number;
      search?: string;
}

export interface IIdentityProviderService {
      getAll(params: ServiceIdentityProviderListParams): Promise<IdentityProviderListResponseJson>;
      getById(id: string): Promise<IdentityProviderJson>;
      create(data: CreateIdentityProviderJson): Promise<{ id: string }>;
      update(id: string, data: UpdateIdentityProviderJson): Promise<void>;
      remove(id: string): Promise<void>;
      testConnection(id: string): Promise<TestConnectionResultJson>;
}
