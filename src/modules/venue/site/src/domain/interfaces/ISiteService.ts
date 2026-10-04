import type { SiteDto, SiteListResponseDto } from "../../data/models/SiteDto";

export interface ListSitesParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface CreateSitePayload {
  name: string;
  branchId?: string;
  address?: string;
  timeZone?: string;
}

export interface UpdateSitePayload {
  name: string;
  branchId?: string;
  address?: string;
  timeZone?: string;
}

export interface ISiteService {
  getAll(params: ListSitesParams): Promise<SiteListResponseDto>;
  getById(id: string): Promise<SiteDto>;
  create(payload: CreateSitePayload): Promise<{ id: string }>;
  update(id: string, payload: UpdateSitePayload): Promise<void>;
  delete(id: string): Promise<void>;
}
