/**
 * Sovereign Account World v3.0 Workstation, Plan, Billing & Ecosystem Domain Entities
 *
 * Categories 4, 5, and 6 domain models for /account/preferences, /account/accessibility,
 * /account/ai-copilot, /account/notifications, /account/plan, /account/billing, and /account/integrations.
 */

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
