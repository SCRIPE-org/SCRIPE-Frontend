import type { RetentionPolicyModel } from "../../data/models/RetentionModels";
import type { UpdateRetentionPolicyRequest } from "../entities/RetentionPolicy";

export interface IRetentionService {
  getAll(): Promise<RetentionPolicyModel[]>;
  update(id: string, data: UpdateRetentionPolicyRequest): Promise<void>;
}
