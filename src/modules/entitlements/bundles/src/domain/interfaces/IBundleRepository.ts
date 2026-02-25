/**
 * Bundle Repository Interface
 */
import type { Bundle } from "../entities/Bundle";
import type { CreateBundleRequest, UpdateBundleRequest } from "../entities/BundleRequests";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

export interface IBundleRepository {
      getAll(params: PaginationParams): Promise<PagedResult<Bundle>>;
      getById(id: string): Promise<Bundle>;
      create(request: CreateBundleRequest): Promise<string>;
      update(id: string, request: UpdateBundleRequest): Promise<void>;
      delete(id: string): Promise<void>;
}
