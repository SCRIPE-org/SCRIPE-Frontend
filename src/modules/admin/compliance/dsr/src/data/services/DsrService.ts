/**
 * DSR Service — HTTP calls only, no business logic.
 * Implements IDsrService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IDsrService } from "../../domain/interfaces/IDsrService";
import type { DsrModel } from "../models/DsrModels";
import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  DsrListParams,
  SubmitDsrRequest,
  ReviewDsrRequest,
} from "../../domain/entities/DsrRequests";
import { DSR_ENDPOINTS } from "./dsr.endpoints";

/**
 * Http API network service for dsr.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class DsrService implements IDsrService {
  constructor(private readonly api: IApiService) {}

  getAll(params: DsrListParams): Promise<PagedResult<DsrModel>> {
    const url = buildUrl(DSR_ENDPOINTS.DSR_LIST, {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...(params.status && { status: params.status }),
      ...(params.requestType && { requestType: params.requestType }),
      ...(params.search && { search: params.search }),
    });
    return this.api.get<PagedResult<DsrModel>>(url);
  }

  getById(id: string): Promise<DsrModel> {
    return this.api.get<DsrModel>(DSR_ENDPOINTS.DSR_BY_ID(id));
  }

  submit(data: SubmitDsrRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(DSR_ENDPOINTS.DSR_SUBMIT, data);
  }

  review(id: string, data: ReviewDsrRequest): Promise<void> {
    return this.api.post<void>(DSR_ENDPOINTS.DSR_REVIEW(id), data);
  }

  cancel(id: string): Promise<void> {
    return this.api.post<void>(DSR_ENDPOINTS.DSR_CANCEL(id), {});
  }

  confirmErasure(id: string): Promise<void> {
    return this.api.post<void>(DSR_ENDPOINTS.DSR_CONFIRM_ERASURE(id), {});
  }

  downloadExport(id: string): Promise<Blob> {
    return this.api.getBlob(DSR_ENDPOINTS.DSR_DOWNLOAD(id));
  }
}
