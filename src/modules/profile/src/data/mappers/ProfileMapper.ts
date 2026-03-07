/**
 * Profile Mapper
 *
 * Transforms API DTOs ↔ Domain Entities.
 * Single responsibility: data transformation only.
 */
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { ActiveSession } from "../../domain/entities/ActiveSession";
import type { SecurityLogEntry } from "../../domain/entities/SecurityLogEntry";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";
import type {
  AdminProfileDto,
  ActiveSessionDto,
  SecurityLogEntryDto,
  ExternalLoginDto,
} from "../models/ProfileModels";

export const ProfileMapper = {
  toAdminProfile(dto: AdminProfileDto): AdminProfile {
    return {
      id: dto.id,
      username: dto.username,
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      phoneNumber: dto.phoneNumber ?? "",
      adminTypeName: dto.adminTypeName ?? "",
      profileImageUrl: dto.profileImageUrl,
      roles: dto.roles ?? [],
      permissions: dto.permissions ?? [],
      isTwoFactorEnabled: dto.isTwoFactorEnabled ?? false,
      backupCodesRemaining: dto.backupCodesRemaining,
      isPasswordExpired: dto.isPasswordExpired ?? false,
      daysUntilPasswordExpiry: dto.daysUntilPasswordExpiry,
      passwordLastChanged: dto.passwordLastChanged ? new Date(dto.passwordLastChanged) : null,
    };
  },

  toActiveSession(dto: ActiveSessionDto): ActiveSession {
    return {
      tokenId: dto.tokenId,
      deviceInfo: dto.deviceInfo ?? "Unknown device",
      ipAddress: dto.ipAddress ?? "Unknown",
      createdAt: new Date(dto.createdAt),
      expiresAt: new Date(dto.expiresAt),
      isCurrent: dto.isCurrent,
    };
  },

  toActiveSessions(dtos: ActiveSessionDto[]): ActiveSession[] {
    return dtos.map(ProfileMapper.toActiveSession);
  },

  toSecurityLogEntry(dto: SecurityLogEntryDto): SecurityLogEntry {
    return {
      id: dto.id,
      eventType: dto.eventType,
      description: dto.description ?? "",
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      timestamp: new Date(dto.timestamp),
      details: dto.details,
    };
  },

  toSecurityLog(dtos: SecurityLogEntryDto[]): SecurityLogEntry[] {
    return dtos.map(ProfileMapper.toSecurityLogEntry);
  },

  toExternalLogin(dto: ExternalLoginDto): ExternalLogin {
    return {
      id: dto.id,
      providerName: dto.providerName,
      providerKey: dto.providerKey,
      email: dto.email,
      displayName: dto.displayName,
      linkedAt: new Date(dto.linkedAt),
      lastUsedAt: dto.lastUsedAt ? new Date(dto.lastUsedAt) : null,
    };
  },

  toExternalLogins(dtos: ExternalLoginDto[]): ExternalLogin[] {
    return dtos.map(ProfileMapper.toExternalLogin);
  },
};
