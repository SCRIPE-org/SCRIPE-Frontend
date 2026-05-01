/**
 * DSR Service — HTTP calls only, no business logic.
 * Implements IDsrService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IDsrService } from "../../domain/interfaces/IDsrService";
import type { DsrModel } from "../models/DsrModels";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type {
  DsrListParams,
  SubmitDsrRequest,
  ReviewDsrRequest,
} from "../../domain/entities/DsrRequests";

export class DsrService implements IDsrService {
  constructor(private readonly api: IApiService) {}

  getAll(params: DsrListParams): Promise<PagedResult<DsrModel>> {
    const url = buildUrl(API_ENDPOINTS.COMPLIANCE.DSR_LIST, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.status && { status: params.status }),
      ...(params.requestType && { requestType: params.requestType }),
      ...(params.search && { search: params.search }),
    });
    return this.api.get<PagedResult<DsrModel>>(url);
  }

  getById(id: string): Promise<DsrModel> {
    return this.api.get<DsrModel>(API_ENDPOINTS.COMPLIANCE.DSR_BY_ID(id));
  }

  submit(data: SubmitDsrRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.COMPLIANCE.DSR_SUBMIT, data);
  }

  review(id: string, data: ReviewDsrRequest): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.COMPLIANCE.DSR_REVIEW(id), data);
  }

  cancel(id: string): Promise<void> {
    return this.api.post<void>(API_ENDPOINTS.COMPLIANCE.DSR_CANCEL(id), {});
  }
}
