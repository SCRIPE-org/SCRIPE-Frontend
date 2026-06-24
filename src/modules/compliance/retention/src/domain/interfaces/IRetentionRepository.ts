import type { RetentionPolicy } from "../entities/RetentionPolicy";
import type {
  UpdateRetentionPolicyRequest,
  CreateRetentionPolicyRequest,
} from "../entities/RetentionPolicy";

/**
 * Interface defining repository methods for managing Retention data access.
 */
export interface IRetentionRepository {
  getAll(): Promise<RetentionPolicy[]>;
  create(data: CreateRetentionPolicyRequest): Promise<string>;
  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
