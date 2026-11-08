/**
 * Sovereign Account World v3.0 Domain Entities
 *
 * Typed domain models for all 15 Sovereign Account slices (/account/*) and
 * the consolidated Telemetry HUD & Security Posture Ring context.
 */
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
  pairedDevicesCount: number;
  travelShieldEnabled: boolean;
  travelShieldExpiresAtUtc?: string | null;
  sudoActive: boolean;
  sudoExpiresAtUtc?: string | null;
}

export interface ClubMembershipSummary {
  tenantId: string;
  clubName: string;
  branchName: string;
  roleTitle: string;
  status: string;
  isPrimary: boolean;
}

export interface LinkedAthleteSummary {
  athleteId: string;
  fullName: string;
  squadName: string;
  shirtNumber: string;
  relationship: string;
  medicalClearanceStatus: string;
}

export interface SovereignDossierSlice {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  staffCode?: string | null;
  bio?: string | null;
  clubAffiliation?: string | null;
  activeBranchName?: string | null;
  editionName?: string | null;
  isAvailableForOperations: boolean;
  securityScore: number;
  tacticalIdentityJson: string;
  clubMemberships: ClubMembershipSummary[];
  linkedAthletes: LinkedAthleteSummary[];
}

export interface AdminCredentialItem {
  id: string;
  category: string;
  governingBody: string;
  title: string;
  licenseNumber: string;
  issuedAtUtc: string;
  expiresAtUtc?: string | null;
  verificationStatus: string;
  documentUrl?: string | null;
  authorityNotes?: string | null;
}

export interface SovereignCredentialsSlice {
  passSerialNumber: string;
  federationBadgeCode: string;
  bloodType: string;
  stadiumZoneClearances: string[];
  qrVerificationToken: string;
  hasDigitalSignatureSeal: boolean;
  digitalSignatureSealPreview?: string | null;
  hasSigningPin: boolean;
  credentials: AdminCredentialItem[];
}

export interface SovereignSecuritySlice {
  isTwoFactorEnabled: boolean;
  backupCodesRemaining: number;
  passkeyCount: number;
  hardwareKeyCount: number;
  securityPostureScore: number;
  postureChecklist: SecurityPostureCheckItem[];
  travelShieldEnabled: boolean;
  travelShieldExpiresAtUtc?: string | null;
  trustedCidrs: string[];
  hasDuressPin: boolean;
  sudoActive: boolean;
  sudoExpiresAtUtc?: string | null;
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
  coachAppPairingToken: string;
  coachAppPairingExpiresAtUtc: string;
  impossibleTravelDetected?: boolean;
}

export interface AdminDeviceItem {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCategory: string;
  platformOs: string;
  appVersion: string;
  postureScore: number;
  isTrusted: boolean;
  isBiometricEnrolled: boolean;
  offlineVaultQuotaMb: number;
  offlinePendingSyncCount: number;
  telemetryBridgeProvider?: string | null;
  lastSeenIp?: string | null;
  lastSeenGeo?: string | null;
  lastActiveAtUtc: string;
}

export interface SovereignDevicesSlice {
  devices: AdminDeviceItem[];
  totalOfflineVaultMb: number;
  totalPendingSyncPackages: number;
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
  activeInspectorPassToken?: string | null;
  inspectorPassExpiresAtUtc?: string | null;
}

export interface SovereignPrivacySlice {
  encryptedScratchpadCiphertext?: string | null;
  aiTelemetryConsent: boolean;
  anonymizedBenchmarkConsent: boolean;
  lastPortabilityExportAtUtc?: string | null;
  recoveryKitSerial: string;
}
