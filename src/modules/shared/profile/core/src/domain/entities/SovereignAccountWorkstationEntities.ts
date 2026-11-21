/**
 * Clean 9-Page B2B Enterprise Account Console (v4.0) Workstation, Plan & Integrations Domain Entities
 *
 * Domain models for /account/preferences, /account/notifications, /account/plan, and /account/integrations.
 */

/** Persisted workstation appearance, layout, localization, and hotkey preferences slice. */
export interface SovereignPreferencesSlice {
  themeMode: string;
  clubAccentHue: string;
  density: string;
  defaultLandingRoute: string;
  sidebarCollapsedByDefault: boolean;
  broadcastPrivacyBlurDefault: boolean;
  reducedMotionEnabled?: boolean;
  typographyScale?: number;
  languageCode?: string;
  operatingTimezone?: string;
  numeralSystem?: string;
  calendarSystem?: string;
  firstDayOfWeek?: string;
  toastPosition?: string;
  customHotkeysJson: string;
  savedFilterPresetsJson: string;
  rowVersion?: string;
  startupTarget?: string | null;
  clearStartupTarget?: boolean;
  activeStartupTarget?: string | null;
  activeContextKey?: string | null;
  isStartupTargetEnforcedByRole?: boolean;
  enforcingRoleName?: string | null;
  startupTargetFallbackActive?: boolean;
  startupTargetFallbackReason?: string | null;
}

/** Per-category notification channel delivery preference rule. */
export interface NotificationCategoryRuleItem {
  category: string;
  displayName: string;
  description: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  isCriticalLocked: boolean;
}

/** Recent in-app notification alert preview item. */
export interface RecentNotificationAlertItem {
  id: string;
  title: string;
  message: string;
  category: string;
  createdAt: string;
  isRead: boolean;
}

/** Notification matrix, quiet hours schedule, and recent alerts slice. */
export interface SovereignNotificationsSlice {
  categoryRules: NotificationCategoryRuleItem[];
  routingMatrixJson: string;
  quietHoursEnabled: boolean;
  quietHoursStartUtc: string;
  quietHoursEndUtc: string;
  securityAlertsBypassQuietHours: boolean;
  unreadNotificationsCount: number;
  recentNotifications: RecentNotificationAlertItem[];
  rowVersion?: string;
}

/** Tenant entitlement feature availability item for the active operator. */
export interface SovereignEntitlementFeatureItem {
  featureCode: string;
  featureName: string;
  category: string;
  state: "allowed" | "club_owned_request_role" | "locked_upgrade";
  description: string;
}

/** Resource consumption vs limit telemetry gauge for an entitled quota. */
export interface SovereignQuotaGaugeItem {
  quotaCode: string;
  label: string;
  used: number;
  limit: number;
  isUnlimited: boolean;
  unit: string;
  source?: string;
}

/** Subscription plan, contract lifecycle, support PIN, and entitlement slice. */
export interface SovereignPlanSlice {
  isPlatformSovereign?: boolean;
  editionCode: string;
  editionName: string;
  tierTagline?: string;
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

/** Structured bilingual metadata for a delegatable Personal Access Token PBAC scope. */
export interface PatScopeOption {
  code: string;
  displayName: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  moduleKey: string;
  category: string;
  resource: string;
  action: string;
  isPlatformOnly: boolean;
}

/** Redacted personal access token summary for developer API access. */
export interface PersonalAccessTokenSummary {
  id: string;
  name: string;
  description?: string | null;
  tokenPrefix: string;
  scopes: string[];
  scopeDetails?: PatScopeOption[];
  allowedCidrs?: string[];
  rateLimitPerMinute?: number | null;
  dailyRequestCount?: number | null;
  createdAtUtc: string;
  expiresAtUtc?: string | null;
  lastUsedAtUtc?: string | null;
  rowVersion?: string | null;
}

/** Linked enterprise identity provider summary item. */
export interface ExternalIdpLinkItem {
  id: string;
  providerName: string;
  protocolType?: string;
  isConnected?: boolean;
  externalEmail: string;
  linkedAtUtc: string;
}

/** Real backend API rate-limit policy and trailing usage telemetry for account integrations. */
export interface AccountIntegrationsRateLimitTelemetry {
  rateLimitingEnabled: boolean;
  requestsPerMinuteLimit: number | null;
  configuredRequestsPerMinuteLimit: number | null;
  hourlyLimit: number | null;
  hourlyRequestsUsed: number;
  hourlyRemaining: number | null;
  dailyRequestsUsed: number;
  remainingQuotaPercentage: number | null;
}

/** Tenant PAT issuance quota telemetry and enablement status for /account/integrations. */
export interface AccountPatQuota {
  activeCount: number;
  maxLimit: number;
  isUnlimited: boolean;
  remaining: number | null;
  isEnabled: boolean;
}

/** Connected external identity links, personal access tokens, and allowed scopes slice. */
export interface SovereignIntegrationsSlice {
  externalIdpLinks: ExternalIdpLinkItem[];
  personalAccessTokens: PersonalAccessTokenSummary[];
  availableScopes: string[];
  scopeCatalog: PatScopeOption[];
  rateLimitTelemetry?: AccountIntegrationsRateLimitTelemetry | null;
  patQuota?: AccountPatQuota | null;
  integrationsFeatureEnabled?: boolean;
}

/** Tamper-evident forensic audit event entry returned by the account activity feed. */
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

/** Query parameters for filtering and paginating the account activity forensic audit log. */
export interface SovereignActivityQuery {
  search?: string;
  category?: string;
  outcome?: "ALL" | "SUCCESS" | "FAILURE";
  fromUtc?: string;
  toUtc?: string;
  page?: number;
  pageSize?: number;
}

/** Paginated forensic activity slice with hash-chain integrity verification status. */
export interface SovereignActivitySlice {
  entries: SovereignAuditEntry[];
  chainIntegrityStatus: string;
  totalEntries?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

