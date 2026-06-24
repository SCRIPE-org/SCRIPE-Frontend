import type {
  IdentityProviderJson,
  IdentityProviderListResponseJson,
  CreateIdentityProviderJson,
  UpdateIdentityProviderJson,
  TestConnectionResultJson,
} from "../types/IdentityProviderTypes";

/**
 * Interface defining property specifications, keys types, and structural contract rules for service identity provider list params.
 */
export interface ServiceIdentityProviderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Http API network service for i identity provider.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IIdentityProviderService {
  getAll(params: ServiceIdentityProviderListParams): Promise<IdentityProviderListResponseJson>;
  getById(id: string): Promise<IdentityProviderJson>;
  create(data: CreateIdentityProviderJson): Promise<{ id: string }>;
  update(id: string, data: UpdateIdentityProviderJson): Promise<void>;
  remove(id: string): Promise<void>;
  testConnection(id: string): Promise<TestConnectionResultJson>;
}
