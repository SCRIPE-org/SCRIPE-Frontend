/**
 * Retention Service — HTTP calls only, no business logic.
 * Implements IRetentionService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IRetentionService } from "../../domain/interfaces/IRetentionService";
import type { RetentionPolicyModel } from "../models/RetentionModels";
import type { UpdateRetentionPolicyRequest } from "../../domain/entities/RetentionPolicy";

export class RetentionService implements IRetentionService {
  constructor(private readonly api: IApiService) {}

  getAll(): Promise<RetentionPolicyModel[]> {
    return this.api.get<RetentionPolicyModel[]>(API_ENDPOINTS.COMPLIANCE.RETENTION_LIST);
  }

  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void> {
    return this.api.put<void>(`${API_ENDPOINTS.COMPLIANCE.RETENTION_UPDATE}/${id}`, data);
  }
}
