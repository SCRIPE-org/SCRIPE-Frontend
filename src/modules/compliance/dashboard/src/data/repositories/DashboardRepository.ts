/**
 * Dashboard Repository — calls service, maps models → domain entities.
 * Implements IDashboardRepository.
 */
import type { IDashboardRepository } from "../../domain/interfaces/IDashboardRepository";
import type { IDashboardService } from "../../domain/interfaces/IDashboardService";
import type { ComplianceDashboard } from "../../domain/entities/DashboardData";
import { DashboardMapper } from "../mappers/DashboardMapper";

export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly service: IDashboardService) {}

  async getDashboard(): Promise<ComplianceDashboard> {
    const model = await this.service.getDashboard();
    return DashboardMapper.toEntity(model);
  }
}
