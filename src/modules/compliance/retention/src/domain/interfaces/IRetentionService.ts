import type {
  RetentionPolicyModel,
  CreateRetentionPolicyRequest,
} from "../../data/models/RetentionModels";
import type { UpdateRetentionPolicyRequest } from "../entities/RetentionPolicy";

/**
 * Http API network service for i retention.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IRetentionService {
  getAll(): Promise<RetentionPolicyModel[]>;
  create(data: CreateRetentionPolicyRequest): Promise<string>;
  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
