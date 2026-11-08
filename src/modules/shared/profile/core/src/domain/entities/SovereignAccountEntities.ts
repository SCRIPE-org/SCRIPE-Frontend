/**
 * Sovereign Account World v3.0 Domain Entities
 *
 * Typed domain models for all 15 Sovereign Account slices (/account/*) and
 * the consolidated Telemetry HUD & Security Posture Ring context.
 */

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

export interface SovereignPreferencesSlice {
  themeMode: string;
  clubAccentHue: string;
  density: string;
  defaultLandingRoute: string;
  sidebarCollapsedByDefault: boolean;
  broadcastPrivacyBlurDefault: boolean;
  customHotkeysJson: string;
  savedFilterPresetsJson: string;
  rowVersion?: string;
}

export interface SovereignAccessibilitySlice {
  sunlightContrastMode: boolean;
  colorBlindPalette: string;
  reducedMotion: boolean;
  screenReaderVerbosity: string;
  fontScalePercent: number;
  operatingTimezone: string;
  preferredLanguage: string;
  numeralSystem: string;
  calendarMode: string;
  firstDayOfWeek: string;
  speedUnit: string;
  weightUnit: string;
  temperatureUnit: string;
  rowVersion?: string;
}

export interface SovereignAiCopilotSlice {
  copilotPersona: string;
  tacticalVocabularyStyle: string;
  scoutingMetricWeightsJson: string;
  morningBriefingEnabled: boolean;
  morningBriefingUtcHour: number;
  memoryEntriesJson: string;
  rowVersion?: string;
}

export interface SovereignNotificationsSlice {
  routingMatrixJson: string;
  quietHoursEnabled: boolean;
  quietHoursStartUtc: string;
  quietHoursEndUtc: string;
  matchDayFocusAutoEnable: boolean;
  vipOverrideRoles: string[];
  rowVersion?: string;
}

export interface SovereignEntitlementFeatureItem {
  featureCode: string;
  featureName: string;
  category: string;
  state: "allowed" | "club_owned_request_role" | "locked_upgrade";
  description: string;
}

export interface SovereignQuotaGaugeItem {
  quotaCode: string;
  label: string;
  used: number;
  limit: number;
  isUnlimited: boolean;
  unit: string;
}

export interface SovereignPlanSlice {
  editionCode: string;
  editionName: string;
  subscriptionStatus: string;
  billingCadence: string;
  contractStartedAtUtc: string;
  contractExpiresAtUtc: string;
  daysRemaining: number;
  assignedSeatRole: string;
  supportSlaTier: string;
  rotatingSupportPin: string;
  supportPinSecondsRemaining: number;
  features: SovereignEntitlementFeatureItem[];
  quotas: SovereignQuotaGaugeItem[];
}

export interface ExpenseClaimItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  incurredAtUtc: string;
  status: string;
}

export interface InvoiceLedgerItem {
  invoiceNumber: string;
  description: string;
  amount: number;
  currency: string;
  issuedAtUtc: string;
  status: string;
}

export interface SovereignBillingSlice {
  reimbursementIbanMasked: string;
  defaultCurrency: string;
  pendingReimbursementTotal: number;
  settledReimbursementTotal: number;
  facilityBookingCreditsBalance: number;
  expenses: ExpenseClaimItem[];
  invoices: InvoiceLedgerItem[];
}

export interface PersonalAccessTokenSummary {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  createdAtUtc: string;
  expiresAtUtc?: string | null;
  lastUsedAtUtc?: string | null;
}

export interface AdminSshKeyItem {
  id: string;
  title: string;
  keyType: string;
  fingerprintSha256: string;
  createdAtUtc: string;
  lastUsedAtUtc?: string | null;
}

export interface AdminWebhookItem {
  id: string;
  name: string;
  targetUrl: string;
  secretPrefix: string;
  subscribedEvents: string[];
  isActive: boolean;
  failureCount: number;
  lastDeliveredAtUtc?: string | null;
}

export interface ExternalIdpLinkItem {
  id: string;
  providerName: string;
  externalEmail: string;
  linkedAtUtc: string;
}

export interface SovereignIntegrationsSlice {
  externalIdpLinks: ExternalIdpLinkItem[];
  personalAccessTokens: PersonalAccessTokenSummary[];
  sshKeys: AdminSshKeyItem[];
  webhooks: AdminWebhookItem[];
  privateIcalFeedUrl: string;
}
