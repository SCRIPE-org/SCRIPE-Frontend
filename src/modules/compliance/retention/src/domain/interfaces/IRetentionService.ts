import type { RetentionPolicyModel, CreateRetentionPolicyRequest } from "../../data/models/RetentionModels";
import type { UpdateRetentionPolicyRequest } from "../entities/RetentionPolicy";

export interface IRetentionService {
  getAll(): Promise<RetentionPolicyModel[]>;
  create(data: CreateRetentionPolicyRequest): Promise<string>;
  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
