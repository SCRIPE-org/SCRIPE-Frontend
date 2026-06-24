import type { DataSubjectRequest } from "../entities/DataSubjectRequest";
import type { PagedResult } from "@core/interfaces/common.interface";
import type { DsrListParams, SubmitDsrRequest, ReviewDsrRequest } from "../entities/DsrRequests";

export interface IDsrRepository {
  getAll(params: DsrListParams): Promise<PagedResult<DataSubjectRequest>>;
  getById(id: string): Promise<DataSubjectRequest>;
  submit(data: SubmitDsrRequest): Promise<string>;
  review(id: string, data: ReviewDsrRequest): Promise<void>;
  cancel(id: string): Promise<void>;
  confirmErasure(id: string): Promise<void>;
  downloadExport(id: string): Promise<Blob>;
}
