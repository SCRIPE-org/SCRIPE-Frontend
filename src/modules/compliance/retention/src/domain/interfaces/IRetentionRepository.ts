import type { RetentionPolicy } from "../entities/RetentionPolicy";
import type {
  UpdateRetentionPolicyRequest,
  CreateRetentionPolicyRequest,
} from "../entities/RetentionPolicy";

/**
 * Repository layer implementing client request queries for i retention.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IRetentionRepository {
  getAll(): Promise<RetentionPolicy[]>;
  create(data: CreateRetentionPolicyRequest): Promise<string>;
  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
