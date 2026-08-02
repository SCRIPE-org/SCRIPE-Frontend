/**
 * DevelopersRepository
 *
 * Bridges the service and domain layers:
 * 1. Delegates HTTP calls to DevelopersService (injected via IDevelopersService)
 * 2. Maps DTOs → DeveloperProfile domain entities
 * 3. Returns typed domain entities to the presentation layer
 *
 * Architecture (H-02 refactor):
 *   ViewModel → DevelopersRepository (this) → IDevelopersService → IApiService → HTTP
 */
import type { IDevelopersService } from "../../domain/interfaces/IDevelopersService";
import { DeveloperProfile } from "../../domain/entities/DeveloperProfile";
import type { IDevelopersRepository } from "../../domain/interfaces/IDevelopersRepository";
import type { DeveloperDto } from "../../domain/interfaces/IDevelopersService";

/**
 * Repository layer implementing client request queries for developers.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class DevelopersRepository implements IDevelopersRepository {
  constructor(private readonly service: IDevelopersService) {}

  async getAll(params: { page: number; pageSize: number; search?: string }) {
    const data = await this.service.getAll(params);
    return { ...data, items: (data.items ?? []).map(this.map) };
  }

  async getById(id: string): Promise<DeveloperProfile> {
    return this.map(await this.service.getById(id));
  }

  async getByTenant(tenantId: string): Promise<DeveloperProfile> {
    return this.map(await this.service.getByTenant(tenantId));
  }

  async create(payload: Parameters<IDevelopersRepository["create"]>[0]): Promise<string> {
    const r = await this.service.create(payload);
    return r.id;
  }

  async update(id: string, payload: Parameters<IDevelopersRepository["update"]>[1]): Promise<void> {
    await this.service.update(id, payload);
  }

  async verify(id: string): Promise<void> {
    await this.service.verify(id);
  }

  /** M-12 fix: Map d.developerName (backend field) not d.displayName (non-existent). */
  private map(d: DeveloperDto): DeveloperProfile {
    return new DeveloperProfile({
      id: d.id,
      tenantId: d.tenantId,
      displayName: d.developerName ?? "",
      contactEmail: d.supportEmail ?? "",
      website: d.website ?? null,
      bio: d.bio ?? null,
      logoUrl: d.logoUrl ?? null,
      isVerified: d.isVerified ?? false,
      appCount: d.appCount ?? 0,
      totalRevenue: d.totalRevenue ?? 0,
      currency: d.currency ?? "USD",
      createdAt: d.createdAt ?? new Date().toISOString(),
    });
  }
}
