import type { RetentionPolicy } from "../entities/RetentionPolicy";
import type { UpdateRetentionPolicyRequest } from "../entities/RetentionPolicy";

export interface IRetentionRepository {
  getAll(): Promise<RetentionPolicy[]>;
  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void>;
  trigger(policyId: string): Promise<void>;
}
