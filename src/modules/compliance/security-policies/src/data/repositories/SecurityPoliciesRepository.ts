import type { ISecurityPoliciesRepository } from "../../domain/interfaces/ISecurityPoliciesRepository";
import type { ISecurityPoliciesService } from "../../domain/interfaces/ISecurityPoliciesService";
import { SecurityPoliciesMapper } from "../mappers/SecurityPoliciesMapper";
import { SecurityPoliciesEntity } from "../../domain/entities/SecurityPoliciesEntity";

export class SecurityPoliciesRepository implements ISecurityPoliciesRepository {
  constructor(private readonly service: ISecurityPoliciesService) {}

  async getAll(params?: Record<string, unknown>): Promise<{ items: SecurityPoliciesEntity[]; totalCount: number }> {
    const result = await this.service.getAll(params) as { items?: unknown[]; totalCount?: number; [key: string]: unknown };
    const items = (result.items || []).map((item: unknown) => SecurityPoliciesMapper.toEntity(item as Parameters<typeof SecurityPoliciesMapper.toEntity>[0]));
    return { items, totalCount: result.totalCount ?? items.length };
  }

  async getById(id: string): Promise<SecurityPoliciesEntity> {
    const result = await this.service.getById(id);
    return SecurityPoliciesMapper.toEntity(result as Parameters<typeof SecurityPoliciesMapper.toEntity>[0]);
  }
}
