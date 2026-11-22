/**
 * Workstation Session Domain Entity
 *
 * Represents an active login session / refresh token instance.
 */
export interface WorkstationSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
  isImpersonated?: boolean;
  impersonatorAdminId?: string | null;
  city?: string | null;
  country?: string | null;
  browser?: string;
  os?: string;
}
