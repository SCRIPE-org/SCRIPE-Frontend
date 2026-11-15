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

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export const ProfileMapper = {
  toAdminProfile(dto: AdminProfileDto): AdminProfile {
    return {
      id: dto.id ?? dto.adminId ?? "",
      username: dto.username ?? "",
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      phoneNumber: dto.phoneNumber ?? "",
      email: dto.email ?? "",
      isEmailVerified: dto.isEmailVerified ?? true,
      adminTypeName: dto.adminTypeName ?? "",
      profileImageUrl: dto.profileImageUrl ?? null,
      roles: dto.roles ?? [],
      permissions: dto.permissions ?? [],
      isTwoFactorEnabled: dto.isTwoFactorEnabled ?? false,
      backupCodesRemaining: dto.backupCodesRemaining ?? null,
      isPasswordExpired: dto.isPasswordExpired ?? false,
      daysUntilPasswordExpiry: dto.daysUntilPasswordExpiry ?? null,
      passwordLastChanged: dto.passwordLastChanged ? new Date(dto.passwordLastChanged) : null,
      staffCode: dto.staffCode ?? "#SCR-ADM-001",
      bio:
        dto.bio ??
        "Enterprise Operations Administrator overseeing multi-branch governance, organizational security, and platform workflows.",
      clubAffiliation: dto.clubAffiliation ?? "Enterprise Organization",
      activeBranchName: dto.activeBranchName ?? "Corporate Headquarters (HQ)",
      editionName: dto.editionName ?? "Enterprise Edition",
      isAvailableForOperations: dto.isAvailableForOperations ?? true,
      securityScore: dto.securityScore ?? 85,
      availableAcademies:
        dto.availableAcademies ||
        (dto.academies
          ? dto.academies.map((a) => ({
              id: a.id,
              name: a.name,
              isCurrent: a.isPrimary ?? false,
            }))
          : dto.clubMemberships && dto.clubMemberships.length > 0
          ? dto.clubMemberships.map((m) => ({
              id: m.tenantId,
              name: m.tenantName ?? m.clubName ?? m.tenantId,
              isCurrent: Boolean(m.isPrimary),
            }))
          : [
              { id: "hq-01", name: "Corporate Headquarters (HQ)", isCurrent: true },
              { id: "branch-02", name: "Nasr City Regional Branch", isCurrent: false },
              { id: "branch-03", name: "Sheikh Zayed Operations Hub", isCurrent: false },
            ]),
      customFields: dto.customFields ?? [],
      rowVersion: dto.rowVersion ?? undefined,
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
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      timestamp: new Date(dto.timestamp),
      details: dto.details
        ? typeof dto.details === "string"
          ? dto.details
          : JSON.stringify(dto.details)
        : null,
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
      email: dto.email ?? null,
      displayName: dto.displayName ?? null,
      linkedAt: new Date(dto.linkedAt),
      lastUsedAt: dto.lastUsedAt ? new Date(dto.lastUsedAt) : null,
    };
  },

  toExternalLogins(dtos: ExternalLoginDto[]): ExternalLogin[] {
    return dtos.map(ProfileMapper.toExternalLogin);
  },
};
