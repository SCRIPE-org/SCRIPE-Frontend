/**
 * Clean 9-Page B2B Enterprise Account Console (v4.0) Domain Entities
 *
 * Typed domain models for the B2B Account Console (/account/*) and
 * the consolidated Telemetry HUD & Security Posture Ring context.
 */
import type { AdminCustomFieldItem } from "./AdminProfile";

export * from "./SovereignAccountWorkstationEntities";

/**
 * Individual security posture item shown in the telemetry checklist.
 */
export interface SecurityPostureCheckItem {
  key: string;
  labelKey: string;
  completed: boolean;
  weight: number;
  targetRoute: string;
}

/**
 * Branch switch target available to the current account principal.
 */
export interface AccountBranchOption {
  branchId: string;
  branchName: string;
  isCurrent: boolean;
}

/**
 * Principal scope metadata distinguishing platform administrators from tenant users.
 */
export interface AccountPrincipalContext {
  principalKind: "PlatformAdmin" | "TenantUser";
  isSuperAdmin: boolean;
  controlPlaneLabel: string;
  activeTenantId?: string | null;
  activeTenantName?: string | null;
  activeBranchId?: string | null;
  activeBranchName?: string | null;
  isSolePrimaryOwner: boolean;
  hasStandingRootAuthority: boolean;
  availableBranches: AccountBranchOption[];
}

/**
 * Colleague directory option selectable as a delegation or succession custodian.
 */
export interface AccountColleagueOption {
  id: string;
  displayName: string;
  email: string;
  username: string;
  staffCode?: string | null;
  roleSummary?: string | null;
}

/**
 * Real backend feature entitlement flags evaluated for the active account principal.
 */
export interface SovereignAccountFeatureFlags {
  integrationsEnabled: boolean;
  twoFactorEnabled: boolean;
  externalSsoEnabled: boolean;
  vacationDelegationEnabled: boolean;
  planAndQuotasEnabled: boolean;
}

/**
 * Shared console telemetry context consumed by the account rail, HUD, and pages.
 */
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
  principalContext?: AccountPrincipalContext;
  featureFlags?: SovereignAccountFeatureFlags;
}

/**
 * Tenant club affiliation entry displayed inside the identity dossier.
 */
export interface ClubMembershipSummary {
  tenantId: string;
  clubName: string;
  branchName: string;
  roleTitle: string;
  status: string;
  isPrimary: boolean;
}

/**
 * Complete profile dossier slice combining personal metadata, memberships, and custom fields.
 */
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
  principalContext?: AccountPrincipalContext;
  rowVersion?: string;
}

/**
 * Account security posture, credential enrollment counts, and IP allowlist state.
 */
/** Live DB-configured Enterprise SSO provider resolved for the current account security view. */
export interface AvailableSsoProvider {
  encryptedId: string;
  name: string;
  slug: string;
  protocol: "oidc" | "oauth2" | "saml" | string;
  scope: "Global" | "Organization" | string;
  iconUrl?: string | null;
  buttonColor?: string | null;
  buttonLabel?: string | null;
  displayOrder: number;
  isLinked: boolean;
  linkedEmail?: string | null;
  linkedAtUtc?: string | null;
  externalLoginId?: string | null;
}

/** Security posture, trusted IP CIDR, passkey, and Enterprise SSO snapshot for the current account. */
export interface SovereignSecuritySlice {
  isTwoFactorEnabled: boolean;
  isTwoFactorFeatureEnabled?: boolean;
  isSsoFeatureEnabled?: boolean;
  isSecurityPageEnabled?: boolean;
  backupCodesRemaining: number;
  passwordLastChangedUtc?: string | null;
  isPasswordExpired?: boolean;
  daysUntilPasswordExpiry?: number | null;
  passkeyCount: number;
  hardwareKeyCount: number;
  securityPostureScore: number;
  postureChecklist: SecurityPostureCheckItem[];
  trustedCidrs: string[];
  sudoActive: boolean;
  sudoExpiresAtUtc?: string | null;
  currentClientIp?: string | null;
  isCurrentIpAllowed: boolean;
  availableSsoProviders: AvailableSsoProvider[];
  passwordPolicy?: import("@core/common/password-policy").PasswordPolicyModel | null;
  rowVersion?: string;
}

/**
 * Active authenticated session telemetry record with geolocation and anomaly indicators.
 */
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

/**
 * Fleet overview of active sessions and impossible-travel alert state.
 */
export interface SovereignSessionsSlice {
  sessions: AccountSessionNode[];
  impossibleTravelDetected?: boolean;
}

/**
 * Provenance trace explaining how a permission was granted to the principal.
 */
export interface PermissionProvenanceNode {
  permissionCode: string;
  domain: string;
  editionSource: string;
  branchScope: string;
  grantingRole: string;
  delegationSource?: string | null;
  isFieldRestricted: boolean;
}

/**
 * Time-bounded authority delegation record between administrators.
 */
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

/**
 * Simulated role persona used to inspect effective governance permissions.
 */
export interface GovernancePersonaOption {
  personaId: string;
  roleTitle: string;
  branchScope: string;
  effectivePermissions: string[];
}

/**
 * Governance authority slice covering roles, provenance, delegations, and succession.
 */
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

/** Re-exported tamper-evident forensic activity entities and query types. */
export type {
  SovereignAuditEntry,
  SovereignActivityQuery,
  SovereignActivitySlice,
} from "./SovereignAccountWorkstationEntities";

