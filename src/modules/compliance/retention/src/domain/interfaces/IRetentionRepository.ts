import type { RetentionPolicy } from "../entities/RetentionPolicy";
import type { UpdateRetentionPolicyRequest } from "../entities/RetentionPolicy";
import type { CreateRetentionPolicyRequest } from "../../data/models/RetentionModels";

export interface IRetentionRepository {
  getAll(): Promise<RetentionPolicy[]>;
  create(data: CreateRetentionPolicyRequest): Promise<string>;
  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
