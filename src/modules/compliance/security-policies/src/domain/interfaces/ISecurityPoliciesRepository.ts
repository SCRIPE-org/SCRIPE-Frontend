import type { SecurityPoliciesEntity } from "../entities/SecurityPoliciesEntity";

export interface ISecurityPoliciesRepository {
  getAll(params?: Record<string, unknown>): Promise<{ items: SecurityPoliciesEntity[]; totalCount: number }>;
  getById(id: string): Promise<SecurityPoliciesEntity>;
}
