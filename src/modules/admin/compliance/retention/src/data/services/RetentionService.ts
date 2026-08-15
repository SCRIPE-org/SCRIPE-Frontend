/**
 * Retention Service — HTTP calls only, no business logic.
 * Implements IRetentionService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IRetentionService } from "../../domain/interfaces/IRetentionService";
import type { RetentionPolicyModel, CreateRetentionPolicyRequest } from "../models/RetentionModels";
import type { UpdateRetentionPolicyRequest } from "../../domain/entities/RetentionPolicy";
import { RETENTION_ENDPOINTS } from "./retention.endpoints";

/**
 * Http API network service for retention.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class RetentionService implements IRetentionService {
  constructor(private readonly api: IApiService) {}

  getAll(): Promise<RetentionPolicyModel[]> {
    return this.api.get<RetentionPolicyModel[]>(RETENTION_ENDPOINTS.RETENTION_LIST);
  }

  create(data: CreateRetentionPolicyRequest): Promise<string> {
    return this.api.post<string>(RETENTION_ENDPOINTS.RETENTION_UPDATE, data);
  }

  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void> {
    return this.api.put<void>(`${RETENTION_ENDPOINTS.RETENTION_UPDATE}/${id}`, data);
  }

  delete(id: string): Promise<void> {
    return this.api.delete<void>(RETENTION_ENDPOINTS.RETENTION_BY_ID(id));
  }
}
