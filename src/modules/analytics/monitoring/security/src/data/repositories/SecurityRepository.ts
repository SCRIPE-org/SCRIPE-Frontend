/**
 * Security Repository
 *
 * Wraps SecurityService and maps DTOs to domain entities.
 * This is what ViewModels consume.
 */
import type { ISecurityRepository } from "../../domain/interfaces/ISecurityRepository";
import type { ISecurityService } from "../../domain/interfaces/ISecurityService";
import type {
  SecurityEvent,
  BlockedIP,
  LoginActivityPoint,
  SecurityChange,
  ActiveSession,
} from "../../domain/entities/SecurityEntities";
import type { DashboardSummaryDto } from "../models/SecurityModels";
import { SecurityMapper } from "../mappers/SecurityMapper";
import { SECURITY_ENDPOINTS } from "../services/security.endpoints";

/**
 * Repository layer implementing client request queries for security.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class SecurityRepository implements ISecurityRepository {
  readonly exportEndpoint = SECURITY_ENDPOINTS.EXPORT_SECURITY;

  constructor(private readonly service: ISecurityService) {}

  async getSecurityEvents(days?: number): Promise<SecurityEvent[]> {
    const dtos = await this.service.getSecurityEvents(days);
    return (dtos as unknown[]).map((dto) => SecurityMapper.toSecurityEvent(dto as never));
  }

  async getTopBlockedIPs(days?: number, limit?: number): Promise<BlockedIP[]> {
    const dtos = await this.service.getTopBlockedIPs(days, limit);
    return (dtos as unknown[]).map((dto) => SecurityMapper.toBlockedIP(dto as never));
  }

  async getLoginActivity(days?: number): Promise<LoginActivityPoint[]> {
    const dtos = await this.service.getLoginActivity(days);
    return (dtos as unknown[]).map((dto) => SecurityMapper.toLoginActivityPoint(dto as never));
  }

  async getRecentChanges(limit?: number): Promise<SecurityChange[]> {
    const dtos = await this.service.getRecentChanges(limit);
    return (dtos as unknown[]).map((dto) => SecurityMapper.toSecurityChange(dto as never));
  }

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    return this.service.getDashboardSummary();
  }

  async getSessions(): Promise<ActiveSession[]> {
    const dtos = await this.service.getSessions();
    return (dtos as unknown[]).map((dto, idx) => SecurityMapper.toActiveSession(dto as never, idx));
  }

  async revokeSession(tokenId: string): Promise<void> {
    return this.service.revokeSession(tokenId);
  }

  async getAdmins(
    pageSize?: number
  ): Promise<{ items: Array<{ id: string; isTwoFactorEnabled?: boolean }>; totalCount: number }> {
    return this.service.getAdmins(pageSize);
  }
}
