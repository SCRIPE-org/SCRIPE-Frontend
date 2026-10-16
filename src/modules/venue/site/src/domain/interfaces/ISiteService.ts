import type { SiteDto, SiteListResponseDto } from "../../data/models/SiteDto";

/**
 * Documentation for module export
 */
export interface ListSitesParams {
  page: number;
  pageSize: number;
  search?: string;
}

/**
 * Documentation for module export
 */
export interface CreateSitePayload {
  name: string;
  branchId?: string;
  address?: string;
  timeZone?: string;
}

/**
 * Documentation for module export
 */
export interface UpdateSitePayload {
  name: string;
  branchId?: string;
  address?: string;
  timeZone?: string;
}

/**
 * Documentation for module export
 */
export interface ISiteService {
  getAll(params: ListSitesParams): Promise<SiteListResponseDto>;
  getById(id: string): Promise<SiteDto>;
  create(payload: CreateSitePayload): Promise<{ id: string }>;
  update(id: string, payload: UpdateSitePayload): Promise<void>;
  delete(id: string): Promise<void>;
}
