import type {
  IdentityProviderJson,
  IdentityProviderListResponseJson,
  CreateIdentityProviderJson,
  UpdateIdentityProviderJson,
  TestConnectionResultJson,
} from "../types/IdentityProviderTypes";

/**
 * Interface structure detailing the properties and attributes of Service Identity Provider List Params.
 */
export interface ServiceIdentityProviderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Interface defining operations for the IdentityProvider network service.
 */
export interface IIdentityProviderService {
  getAll(params: ServiceIdentityProviderListParams): Promise<IdentityProviderListResponseJson>;
  getById(id: string): Promise<IdentityProviderJson>;
  create(data: CreateIdentityProviderJson): Promise<{ id: string }>;
  update(id: string, data: UpdateIdentityProviderJson): Promise<void>;
  remove(id: string): Promise<void>;
  testConnection(id: string): Promise<TestConnectionResultJson>;
}
