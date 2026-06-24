import type { DataSubjectRequest } from "../entities/DataSubjectRequest";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { DsrListParams, SubmitDsrRequest, ReviewDsrRequest } from "../entities/DsrRequests";

/**
 * Repository layer implementing client request queries for i dsr.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IDsrRepository {
  getAll(params: DsrListParams): Promise<PagedResult<DataSubjectRequest>>;
  getById(id: string): Promise<DataSubjectRequest>;
  submit(data: SubmitDsrRequest): Promise<string>;
  review(id: string, data: ReviewDsrRequest): Promise<void>;
  cancel(id: string): Promise<void>;
  confirmErasure(id: string): Promise<void>;
  downloadExport(id: string): Promise<Blob>;
}
