import type {
  IdentityProvider,
  IdentityProviderListItem,
  TestConnectionResult,
  CreateIdentityProviderRequest,
  UpdateIdentityProviderRequest,
} from "../entities/IdentityProvider";

/**
 * Repository layer implementing client request queries for i identity provider.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IIdentityProviderRepository {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: IdentityProviderListItem[]; totalCount: number }>;

  getById(id: string): Promise<IdentityProvider>;

  create(data: CreateIdentityProviderRequest): Promise<{ id: string }>;

  update(id: string, data: UpdateIdentityProviderRequest): Promise<void>;

  remove(id: string): Promise<void>;

  testConnection(id: string): Promise<TestConnectionResult>;
}
