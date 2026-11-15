/**
 * Clean 9-Page B2B Enterprise Account Console (v4.0) Domain Entities
 *
 * Typed domain models for the B2B Account Console (/account/*) and
 * the consolidated Telemetry HUD & Security Posture Ring context.
 */
import type { AdminCustomFieldItem } from "./AdminProfile";

export * from "./SovereignAccountWorkstationEntities";

export interface SecurityPostureCheckItem {
  key: string;
  labelKey: string;
  completed: boolean;
  weight: number;
  targetRoute: string;
}

export interface SovereignAccountContext {
  adminId: string;
  tenantId?: string | null;
  username: string;
  fullName: string;
  email?: string | null;
  staffCode: string;
  clubAffiliation: string;
  activeBranchName: string;
  editionName: string;
  isAvailableForOperations: boolean;
  securityPostureScore: number;
  postureChecklist: SecurityPostureCheckItem[];
  activeSessionsCount: number;
  sudoActive: boolean;
  sudoExpiresAtUtc?: string | null;
  supportVerificationPin?: string;
}

export interface ClubMembershipSummary {
  tenantId: string;
  clubName: string;
  branchName: string;
  roleTitle: string;
  status: string;
  isPrimary: boolean;
}

export interface SovereignDossierSlice {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  isEmailVerified: boolean;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  staffCode?: string | null;
  bio?: string | null;
  clubAffiliation?: string | null;
  activeBranchName?: string | null;
  editionName?: string | null;
  isAvailableForOperations: boolean;
  securityScore: number;
  clubMemberships: ClubMembershipSummary[];
  customFields: AdminCustomFieldItem[];
  rowVersion?: string;
}

export interface SovereignSecuritySlice {
  isTwoFactorEnabled: boolean;
  backupCodesRemaining: number;
  passkeyCount: number;
  hardwareKeyCount: number;
  securityPostureScore: number;
  postureChecklist: SecurityPostureCheckItem[];
  trustedCidrs: string[];
  sudoActive: boolean;
  sudoExpiresAtUtc?: string | null;
  currentClientIp?: string | null;
  isCurrentIpAllowed: boolean;
  rowVersion?: string;
}

export interface AccountSessionNode {
  sessionId: string;
  deviceLabel: string;
  browserOs: string;
  ipAddress: string;
  geoLocation: string;
  asnIsp: string;
  latitude: number;
  longitude: number;
  isCurrent: boolean;
  isImpossibleTravelFlagged: boolean;
  latencyMs: number;
  createdAtUtc: string;
  lastActiveAtUtc: string;
}

export interface SovereignSessionsSlice {
  sessions: AccountSessionNode[];
  impossibleTravelDetected?: boolean;
}

export interface PermissionProvenanceNode {
  permissionCode: string;
  domain: string;
  editionSource: string;
  branchScope: string;
  grantingRole: string;
  delegationSource?: string | null;
  isFieldRestricted: boolean;
}

export interface AdminDelegationItem {
  id: string;
  principalAdminId: string;
  delegateAdminId: string;
  delegateDisplayName: string;
  delegationType: string;
  grantedScopes: string[];
  justification: string;
  startsAtUtc: string;
  expiresAtUtc: string;
  revokedAtUtc?: string | null;
  status: string;
}

export interface GovernancePersonaOption {
  personaId: string;
  roleTitle: string;
  branchScope: string;
  effectivePermissions: string[];
}

export interface SovereignGovernanceSlice {
  isSuperAdmin?: boolean;
  isProtected?: boolean;
  isDelegationFeatureEnabled: boolean;
  activeTenantName?: string | null;
  activeBranchName?: string | null;
  allowedBranches: string[];
  assignedRoles: Array<{ id?: string; name: string; description?: string | null; isSystemRole?: boolean }>;
  effectivePermissions: string[];
  provenanceGraph: PermissionProvenanceNode[];
  delegations: AdminDelegationItem[];
  successionCustodianAdminId?: string | null;
  successionCustodianName?: string | null;
  simulatorPersonas: GovernancePersonaOption[];
}

export interface SovereignAuditEntry {
  id: string;
  eventType: string;
  category?: string;
  outcome?: string;
  severity: string;
  timestampUtc: string;
  ipAddress: string;
  correlationId: string;
  previousHashShort: string;
  entryHashShort: string;
  payloadJson: string;
}

export interface SovereignActivitySlice {
  entries: SovereignAuditEntry[];
  chainIntegrityStatus: string;
  totalEntries?: number;
}

