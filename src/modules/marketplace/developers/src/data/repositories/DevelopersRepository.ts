"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import { DeveloperProfile } from "../../domain/entities/DeveloperProfile";
import type { IDevelopersRepository } from "../../domain/interfaces/IDevelopersRepository";

export class DevelopersRepository implements IDevelopersRepository {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; search?: string }) {
    const q = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize), ...(params.search && { search: params.search }) });
    const data = await this.api.get<any>(`${MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPERS}?${q}`);
    return { ...data, items: (data.items ?? []).map(this.map) };
  }

  async getById(id: string): Promise<DeveloperProfile> {
    return this.map(await this.api.get<any>(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_BY_ID(id)));
  }

  async getByTenant(tenantId: string): Promise<DeveloperProfile> {
    return this.map(await this.api.get<any>(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_BY_TENANT(tenantId)));
  }

  async create(payload: any): Promise<string> {
    const r = await this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPERS, payload);
    return r.id;
  }

  async update(id: string, payload: any): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_BY_ID(id), payload);
  }

  async verify(id: string): Promise<void> {
    await this.api.post(MARKETPLACE_ENDPOINTS.MARKETPLACE.DEVELOPER_VERIFY(id), {});
  }

  private map(d: any): DeveloperProfile {
    return new DeveloperProfile({
      id: d.id, tenantId: d.tenantId, displayName: d.displayName ?? "",
      contactEmail: d.contactEmail ?? "", website: d.website ?? null,
      bio: d.bio ?? null, logoUrl: d.logoUrl ?? null,
      isVerified: d.isVerified ?? false, appCount: d.appCount ?? 0,
      totalRevenue: d.totalRevenue ?? 0, currency: d.currency ?? "USD",
      createdAt: d.createdAt ?? new Date().toISOString(),
    });
  }
}
