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
    let parsedLicenses = dto.coachingLicenses;
    if (!parsedLicenses && dto.coachingLicensesJson) {
      try {
        parsedLicenses = JSON.parse(dto.coachingLicensesJson);
      } catch {
        parsedLicenses = undefined;
      }
    }

    let parsedPhilosophy = dto.tacticalPhilosophy;
    if (!parsedPhilosophy && dto.tacticalPhilosophyJson) {
      try {
        parsedPhilosophy = JSON.parse(dto.tacticalPhilosophyJson);
      } catch {
        parsedPhilosophy = undefined;
      }
    }

    return {
      id: dto.id,
      username: dto.username,
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      phoneNumber: dto.phoneNumber ?? "",
      email: dto.email ?? "",
      adminTypeName: dto.adminTypeName ?? "",
      profileImageUrl: dto.profileImageUrl,
      roles: dto.roles ?? [],
      permissions: dto.permissions ?? [],
      isTwoFactorEnabled: dto.isTwoFactorEnabled ?? false,
      backupCodesRemaining: dto.backupCodesRemaining,
      isPasswordExpired: dto.isPasswordExpired ?? false,
      daysUntilPasswordExpiry: dto.daysUntilPasswordExpiry,
      passwordLastChanged: dto.passwordLastChanged ? new Date(dto.passwordLastChanged) : null,
      staffCode: dto.staffCode ?? "#SCR-ADM-001",
      bio:
        dto.bio ??
        "Director of Football Operations and Technical Lead. Overseeing multi-age squad development, sports science telemetry, and matchday tactical systems.",
      clubAffiliation: dto.clubAffiliation ?? "Al-Ahly SC",
      activeBranchName: dto.activeBranchName ?? "Gezira Central Campus (HQ)",
      editionName: dto.editionName ?? "Enterprise Ultra",
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
          : [
              { id: "acad-01", name: "Gezira Central Campus (HQ)", isCurrent: true },
              { id: "acad-02", name: "Nasr City Elite Training Ground", isCurrent: false },
              { id: "acad-03", name: "Sheikh Zayed Development Center", isCurrent: false },
            ]),
      coachingLicenses: parsedLicenses ?? [
        {
          id: "lic-01",
          organization: "UEFA",
          licenseLevel: "UEFA Pro License",
          certificateNumber: "UEFA-PRO-2024-8841",
          issuedAt: "2024-05-15T00:00:00Z",
          expiresAt: "2027-05-15T00:00:00Z",
          verificationStatus: "Verified",
        },
        {
          id: "lic-02",
          organization: "CAF",
          licenseLevel: "CAF Elite Youth Instructor",
          certificateNumber: "CAF-EYI-2023-0192",
          issuedAt: "2023-08-20T00:00:00Z",
          expiresAt: "2026-08-20T00:00:00Z",
          verificationStatus: "Verified",
        },
      ],
      tacticalPhilosophy: parsedPhilosophy ?? {
        preferredFormation: "4-3-3 Attacking (Fluid Triangular Rotations)",
        pressingIntensity: "High Gegenpress (PPDA < 7.5)",
        buildUpStyle: "Positional Play from Deep (Third-Man Runs)",
        manifesto:
          "Dominate spatial progression through structured overloads, instantaneous vertical counter-pressing upon turnover, and youth athlete cognitive empowerment.",
        assignedAgeGroups: [
          "U17 Premier League Squad",
          "U19 Academy Elite",
          "First Team Technical Analyst",
        ],
      },
      adminSettingsJson: dto.adminSettingsJson ?? null,
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
