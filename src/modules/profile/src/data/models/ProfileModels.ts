/**
 * Profile DTOs (Models)
 *
 * Raw API request/response shapes matching the backend exactly.
 * ProfileMapper converts these to/from domain entities.
 */

// ===== Response DTOs =====

export interface AdminProfileDto {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      adminTypeName: string;
      profileImageUrl: string | null;
      roles?: Array<{ roleCode?: string; roleName?: string }>;
      permissions?: string[];
      isTwoFactorEnabled: boolean;
      backupCodesRemaining: number | null;
      isPasswordExpired: boolean;
      daysUntilPasswordExpiry: number | null;
      passwordLastChanged: string | null;
}

export interface ActiveSessionDto {
      tokenId: string;
      deviceInfo: string;
      ipAddress: string;
      createdAt: string;
      expiresAt: string;
      isCurrent: boolean;
}

export interface SecurityLogEntryDto {
      id: string;
      eventType: string;
      description: string;
      ipAddress: string | null;
      userAgent: string | null;
      timestamp: string;
      details: string | null;
}

// ===== Request DTOs =====

export interface UpdateProfileDto {
      firstName: string;
      lastName: string;
      phoneNumber: string;
}

export interface ChangePasswordDto {
      currentPassword: string;
      newPassword: string;
      twoFactorCode?: string;
}

export interface RegenerateBackupCodesDto {
      twoFactorCode: string;
}
