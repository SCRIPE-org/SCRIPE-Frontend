import type { DsrModel } from "../../data/models/DsrModels";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { DsrListParams, SubmitDsrRequest, ReviewDsrRequest } from "../entities/DsrRequests";

/**
 * Interface defining operations for the Dsr network service.
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
