/**
 * Clean 9-Page B2B Enterprise Account Console (v4.0) Workstation, Plan & Integrations Domain Entities
 *
 * Domain models for /account/preferences, /account/notifications, /account/plan, and /account/integrations.
 */

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
  customHotkeysJson: string;
  savedFilterPresetsJson: string;
  rowVersion?: string;
}

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

export interface RecentNotificationAlertItem {
  id: string;
  title: string;
  message: string;
  category: string;
  createdAt: string;
  isRead: boolean;
}

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

export interface PersonalAccessTokenSummary {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  createdAtUtc: string;
  expiresAtUtc?: string | null;
  lastUsedAtUtc?: string | null;
}

export interface ExternalIdpLinkItem {
  id: string;
  providerName: string;
  protocolType?: string;
  isConnected?: boolean;
  externalEmail: string;
  linkedAtUtc: string;
}

export interface SovereignIntegrationsSlice {
  externalIdpLinks: ExternalIdpLinkItem[];
  personalAccessTokens: PersonalAccessTokenSummary[];
  availableScopes: string[];
}

