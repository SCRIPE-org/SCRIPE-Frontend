/**
 * Admin Profile Entity & Sports Credentials Domain Models
 *
 * Domain entity representing the current admin's profile data, sports accreditations,
 * coaching licenses, and tactical philosophy.
 * Mapped from API DTO via ProfileMapper.
 */

export interface CoachingLicense {
  id: string;
  organization: "UEFA" | "CAF" | "USSF" | "AFC" | "FIFA" | string;
  licenseLevel: string;
  certificateNumber: string;
  issuedAt: string;
  expiresAt: string;
  verificationStatus: "Verified" | "Pending" | "Expired" | "Revoked";
}

export interface TacticalPhilosophy {
  preferredFormation: string;
  pressingIntensity: string;
  buildUpStyle: string;
  manifesto: string;
  assignedAgeGroups: string[];
}

export interface AdminProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  adminTypeName: string;
  profileImageUrl: string | null;
  roles: Array<{ roleCode?: string; roleName?: string }>;
  permissions: string[];

  // 2FA
  isTwoFactorEnabled: boolean;
  backupCodesRemaining: number | null;

  // Password expiry
  isPasswordExpired: boolean;
  daysUntilPasswordExpiry: number | null;
  passwordLastChanged: Date | null;

  // Transcendence Fields
  staffCode?: string;
  bio?: string;
  clubAffiliation?: string;
  activeBranchName?: string;
  editionName?: string;
  isAvailableForOperations?: boolean;
  securityScore?: number;
  availableAcademies?: Array<{ id: string; name: string; isCurrent: boolean }>;

  // Sports Credentials & Tactical Vault
  coachingLicenses?: CoachingLicense[];
  tacticalPhilosophy?: TacticalPhilosophy;

  // Persisted Workstation Settings & PAT Metadata JSON
  adminSettingsJson?: string | null;
}
