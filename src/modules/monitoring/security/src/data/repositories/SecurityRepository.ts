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
} from "../../domain/entities/SecurityEntities";
import { SecurityMapper } from "../mappers/SecurityMapper";

/**
 * Repository implementation for managing database operations on Security resources.
 */
export class SecurityRepository implements ISecurityRepository {
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
}
