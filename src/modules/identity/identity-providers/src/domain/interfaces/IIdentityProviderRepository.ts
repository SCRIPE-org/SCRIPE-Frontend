import type {
  IdentityProvider,
  IdentityProviderListItem,
  TestConnectionResult,
  CreateIdentityProviderRequest,
  UpdateIdentityProviderRequest,
} from "../entities/IdentityProvider";

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
