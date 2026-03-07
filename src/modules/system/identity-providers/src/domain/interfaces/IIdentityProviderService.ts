import type {
      IdentityProviderJson,
      IdentityProviderListResponseJson,
      CreateIdentityProviderJson,
      UpdateIdentityProviderJson,
      TestConnectionResultJson,
} from "../../data/models/IdentityProviderModel";

export interface ServiceIdentityProviderListParams {
      page?: number;
      pageSize?: number;
      search?: string;
}

export interface IIdentityProviderService {
      getAll(params: ServiceIdentityProviderListParams): Promise<IdentityProviderListResponseJson>;
      getById(id: string): Promise<IdentityProviderJson>;
      create(data: CreateIdentityProviderJson): Promise<IdentityProviderJson>;
      update(id: string, data: UpdateIdentityProviderJson): Promise<void>;
      remove(id: string): Promise<void>;
      testConnection(id: string): Promise<TestConnectionResultJson>;
}
