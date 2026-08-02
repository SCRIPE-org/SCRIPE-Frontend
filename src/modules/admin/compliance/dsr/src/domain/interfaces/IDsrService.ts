import type { DsrModel } from "../../data/models/DsrModels";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { DsrListParams, SubmitDsrRequest, ReviewDsrRequest } from "../entities/DsrRequests";

/**
 * Http API network service for i dsr.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IDsrService {
  getAll(params: DsrListParams): Promise<PagedResult<DsrModel>>;
  getById(id: string): Promise<DsrModel>;
  submit(data: SubmitDsrRequest): Promise<{ id: string }>;
  review(id: string, data: ReviewDsrRequest): Promise<void>;
  cancel(id: string): Promise<void>;
  confirmErasure(id: string): Promise<void>;
  downloadExport(id: string): Promise<Blob>;
}
