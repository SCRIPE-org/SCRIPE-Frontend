import type { DsrModel } from "../../data/models/DsrModels";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type { DsrListParams, SubmitDsrRequest, ReviewDsrRequest } from "../entities/DsrRequests";

export interface IDsrService {
  getAll(params: DsrListParams): Promise<PagedResult<DsrModel>>;
  getById(id: string): Promise<DsrModel>;
  submit(data: SubmitDsrRequest): Promise<{ id: string }>;
  review(id: string, data: ReviewDsrRequest): Promise<void>;
  cancel(id: string): Promise<void>;
}
