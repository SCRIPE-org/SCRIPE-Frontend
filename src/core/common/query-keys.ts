/**
 * Query Keys Factory — NEXORA Frontend
 *
 * Centralized factory for ALL React Query cache keys across every module.
 * This ensures:
 *  - Predictable hierarchical cache invalidation
 *  - No key collisions between modules
 *  - Type-safe invalidation via `.all`, `.lists()`, `.detail(id)`
 *
 * @example
 * import { qk } from '@core/common/query-keys';
 *
 * // In a viewmodel:
 * const { data } = useQuery({
 *   queryKey: qk.admins.list({ tenantId, page: 1 }),
 *   queryFn: () => adminRepo.getAll({ tenantId, page: 1 }),
 * });
 *
 * // Invalidation (all admin queries):
 * queryClient.invalidateQueries({ queryKey: qk.admins.all });
 *
 * // Invalidation (specific admin):
 * queryClient.invalidateQueries({ queryKey: qk.admins.detail(id) });
 */

// ─── Factory Helper ───────────────────────────────────────────────────────────

function domain<T extends string>(key: T) {
  const base = [key] as const;
  return {
    /** Invalidates ALL queries in this domain */
    all: base,
    /** All list queries in this domain */
    lists: () => [...base, "list"] as const,
    /** Specific list with params (pagination, filters) */
    list: (params?: Record<string, unknown>) =>
      params ? ([...base, "list", params] as const) : ([...base, "list"] as const),
    /** All detail queries in this domain */
    details: () => [...base, "detail"] as const,
    /** Specific entity detail */
    detail: (id: string) => [...base, "detail", id] as const,
  };
}

// ─── Module Key Definitions ───────────────────────────────────────────────────

/** Auth */
const auth = {
  all: ["auth"] as const,
  session: () => ["auth", "session"] as const,
  user: () => ["auth", "user"] as const,
  branding: (domain?: string) => ["auth", "branding", domain ?? ""] as const,
};

/** Identity — Admins */
const admins = {
  ...domain("admins"),
  roles: (adminId: string) => ["admins", "roles", adminId] as const,
  active: (tenantId: string) => ["admins", "active", tenantId] as const,
};

/** Identity — Roles */
const roles = {
  ...domain("roles"),
  permissions: (roleId: string) => ["roles", "permissions", roleId] as const,
  forSelect: (tenantId?: string) => ["roles", "select", tenantId ?? ""] as const,
  active: (tenantId: string) => ["roles", "active", tenantId] as const,
};


/** Identity — Tenants */
const tenants = {
  ...domain("tenants"),
  children: (parentId: string) => ["tenants", "children", parentId] as const,
  settings: (tenantId: string) => ["tenants", "settings", tenantId] as const,
  subscription: (tenantId: string) => ["tenants", "subscription", tenantId] as const,
  permissions: (tenantId: string) => ["tenants", "permissions", tenantId] as const,
  roles: (tenantId: string) => ["tenants", "roles", tenantId] as const,
  userGroups: (tenantId: string) => ["tenants", "user-groups", tenantId] as const,
  tree: () => ["tenants", "tree"] as const,
};

/** Identity — Users */
const users = {
  ...domain("users"),
  profile: () => ["users", "profile"] as const,
  byTenant: (tenantId: string) => ["users", "by-tenant", tenantId] as const,
};

/** Identity — User Groups */
const userGroups = {
  ...domain("user-groups"),
  members: (groupId: string) => ["user-groups", "members", groupId] as const,
  roles: (groupId: string) => ["user-groups", "roles", groupId] as const,
};

/** Identity — Permissions */
const permissions = {
  all: ["permissions"] as const,
  catalog: () => ["permissions", "catalog"] as const,
  byRole: (roleId: string) => ["permissions", "role", roleId] as const,
  byTenant: (tenantId: string) => ["permissions", "tenant", tenantId] as const,
};

/** Identity — Identity Providers */
const identityProviders = { ...domain("identity-providers") };

/** Identity — OAuth Apps */
const oauthApps = {
  ...domain("oauth-apps"),
  consents: (tenantId: string) => ["oauth-apps", "consents", tenantId] as const,
};

/** Entitlements — Editions */
const editions = {
  ...domain("editions"),
  pricing: (editionId: string) => ["editions", "pricing", editionId] as const,
  promotions: (editionId: string) => ["editions", "promotions", editionId] as const,
  versions: (editionId: string) => ["editions", "versions", editionId] as const,
  features: (editionId: string) => ["editions", "features", editionId] as const,
  comparison: (ids: string[]) => ["editions", "comparison", ids] as const,
  available: (tenantId: string) => ["editions", "available", tenantId] as const,
};

/** Entitlements — Features */
const features = {
  ...domain("features"),
  definitions: () => ["features", "definitions"] as const,
  effective: (tenantId: string) => ["features", "effective", tenantId] as const,
};

/** Entitlements — Subscriptions */
const subscriptions = {
  ...domain("subscriptions"),
  byTenant: (tenantId: string) => ["subscriptions", "tenant", tenantId] as const,
  my: () => ["subscriptions", "my"] as const,
  overview: () => ["subscriptions", "overview"] as const,
};

/** Entitlements — Overrides */
const overrides = {
  ...domain("overrides"),
  byTenant: (tenantId: string) => ["overrides", "tenant", tenantId] as const,
};

/** Entitlements — Payment Gateways */
const paymentGateways = { ...domain("payment-gateways") };

/** Entitlements — Tenant Gateways */
const tenantGateways = {
  ...domain("tenant-gateways"),
  byTenant: (tenantId: string) => ["tenant-gateways", "tenant", tenantId] as const,
};

/** Entitlements — Tenant Plans */
const tenantPlans = {
  ...domain("tenant-plans"),
  promotions: (planId: string) => ["tenant-plans", "promotions", planId] as const,
  features: (planId: string) => ["tenant-plans", "features", planId] as const,
  comparison: (ids: string[]) => ["tenant-plans", "comparison", ids] as const,
};

/** Entitlements — User Subscriptions */
const userSubscriptions = {
  ...domain("user-subscriptions"),
  my: () => ["user-subscriptions", "my"] as const,
};

/** Entitlements — Billing */
const billing = {
  all: ["billing"] as const,
  dashboard: (tenantId?: string) => ["billing", "dashboard", tenantId ?? ""] as const,
};

/** Entitlements — Commission / Stripe Connect */
const commissions = {
  all: ["commissions"] as const,
  ledger: (params?: Record<string, unknown>) => ["commissions", "ledger", params ?? {}] as const,
  dashboard: () => ["commissions", "dashboard"] as const,
  payouts: (accountId?: string) => ["commissions", "payouts", accountId ?? ""] as const,
  transactions: (accountId?: string) => ["commissions", "transactions", accountId ?? ""] as const,
  connect: () => ["commissions", "connect"] as const,
};

/** Entitlements — Analytics */
const entitlementsAnalytics = {
  all: ["entitlements-analytics"] as const,
  reports: (params?: Record<string, unknown>) => ["entitlements-analytics", "reports", params ?? {}] as const,
  preview: (reportId: string) => ["entitlements-analytics", "preview", reportId] as const,
};

/** Plugins — Catalog */
const pluginsCatalog = { ...domain("plugins-catalog") };

/** Plugins — Installed */
const pluginsInstalled = {
  ...domain("plugins-installed"),
  byTenant: (tenantId: string) => ["plugins-installed", "tenant", tenantId] as const,
  detail: (tenantId: string, installationId: string) =>
    ["plugins-installed", "detail", tenantId, installationId] as const,
  settings: (installationId: string) => ["plugins-installed", "settings", installationId] as const,
  logs: (installationId: string, params?: Record<string, unknown>) =>
    ["plugins-installed", "logs", installationId, params ?? {}] as const,
};

/** Plugins — Definitions */
const pluginsDefinitions = { ...domain("plugins-definitions") };

/** Messaging — Webhooks */
const webhooks = {
  ...domain("webhooks"),
  deliveries: (webhookId: string, params?: Record<string, unknown>) =>
    ["webhooks", "deliveries", webhookId, params ?? {}] as const,
};

/** Messaging — Message Templates */
const messageTemplates = { ...domain("message-templates") };

/** Messaging — Notification Sender */
const notifications = {
  all: ["notifications"] as const,
  targets: () => ["notifications", "targets"] as const,
  templates: () => ["notifications", "templates"] as const,
};

/** Messaging — Email Composer */
const emailComposer = {
  all: ["email-composer"] as const,
  recipients: (search?: string) => ["email-composer", "recipients", search ?? ""] as const,
  templates: () => ["email-composer", "templates"] as const,
};

/** Marketplace — App Listings */
const marketplaceListings = {
  ...domain("marketplace-listings"),
  featured: () => ["marketplace-listings", "featured"] as const,
  pending: () => ["marketplace-listings", "pending"] as const,
};

/** Marketplace — Categories */
const marketplaceCategories = { ...domain("marketplace-categories") };

/** Marketplace — Developers */
const marketplaceDevelopers = { ...domain("marketplace-developers") };

/** Marketplace — Reviews */
const marketplaceReviews = {
  ...domain("marketplace-reviews"),
  byListing: (listingId: string) => ["marketplace-reviews", "listing", listingId] as const,
};

/** Marketplace — Submissions */
const marketplaceSubmissions = { ...domain("marketplace-submissions") };

/** Marketplace — Financials */
const marketplaceFinancials = {
  all: ["marketplace-financials"] as const,
  payouts: (params?: Record<string, unknown>) => ["marketplace-financials", "payouts", params ?? {}] as const,
  revenue: (params?: Record<string, unknown>) => ["marketplace-financials", "revenue", params ?? {}] as const,
};

/** Monitoring — Audit */
const auditLogs = {
  ...domain("audit-logs"),
  realtime: (tenantId?: string) => ["audit-logs", "realtime", tenantId ?? ""] as const,
};

/** Monitoring — Security Dashboard */
const securityDashboard = {
  all: ["security-dashboard"] as const,
  overview: (tenantId?: string) => ["security-dashboard", "overview", tenantId ?? ""] as const,
  threats: (params?: Record<string, unknown>) => ["security-dashboard", "threats", params ?? {}] as const,
};

/** Monitoring — Analytics */
const monitoringAnalytics = {
  all: ["monitoring-analytics"] as const,
  tenant: (tenantId: string, params?: Record<string, unknown>) =>
    ["monitoring-analytics", "tenant", tenantId, params ?? {}] as const,
};

/** Monitoring — Dashboard */
const monitoringDashboard = {
  all: ["monitoring-dashboard"] as const,
  overview: () => ["monitoring-dashboard", "overview"] as const,
  realtime: () => ["monitoring-dashboard", "realtime"] as const,
};

/** Compliance — Consent */
const complianceConsent = {
  all: ["compliance-consent"] as const,
  records: (params?: Record<string, unknown>) => ["compliance-consent", "records", params ?? {}] as const,
  dashboard: () => ["compliance-consent", "dashboard"] as const,
};

/** Compliance — DSR */
const complianceDsr = {
  ...domain("compliance-dsr"),
  my: () => ["compliance-dsr", "my"] as const,
};

/** Compliance — Reports */
const complianceReports = {
  ...domain("compliance-reports"),
  scheduled: () => ["compliance-reports", "scheduled"] as const,
};

/** Compliance — Retention */
const complianceRetention = { ...domain("compliance-retention") };

/** Compliance — Regulations */
const complianceRegulations = { ...domain("compliance-regulations") };

/** Compliance — Inventory */
const complianceInventory = { ...domain("compliance-inventory") };

/** Compliance — Dashboard */
const complianceDashboard = {
  all: ["compliance-dashboard"] as const,
  overview: () => ["compliance-dashboard", "overview"] as const,
};

/** Customization — Branding / Studio */
const branding = {
  all: ["branding"] as const,
  studio: (tenantId: string) => ["branding", "studio", tenantId] as const,
  themes: (params?: Record<string, unknown>) => ["branding", "themes", params ?? {}] as const,
  themeDetail: (themeId: string) => ["branding", "theme", themeId] as const,
  bundles: (tenantId: string) => ["branding", "bundles", tenantId] as const,
  gallery: (params?: Record<string, unknown>) => ["branding", "gallery", params ?? {}] as const,
};

/** Customization — Menus */
const menus = {
  all: ["menus"] as const,
  tree: (tenantId?: string) => ["menus", "tree", tenantId ?? ""] as const,
  overrides: (tenantId: string) => ["menus", "overrides", tenantId] as const,
  detail: (menuId: string) => ["menus", "detail", menuId] as const,
};

/** Customization — Tenant Settings */
const tenantSettings = {
  all: ["tenant-settings"] as const,
  byTenant: (tenantId: string) => ["tenant-settings", tenantId] as const,
  live: (domain?: string) => ["tenant-settings", "live", domain ?? ""] as const,
};

/** Profile */
const profile = {
  all: ["profile"] as const,
  general: () => ["profile", "general"] as const,
  security: () => ["profile", "security"] as const,
  sessions: () => ["profile", "sessions"] as const,
  avatar: () => ["profile", "avatar"] as const,
  externalLogins: () => ["profile", "external-logins"] as const,
  activityLog: (params?: Record<string, unknown>) => ["profile", "activity-log", params ?? {}] as const,
};

/** Navigation */
const navigation = {
  all: ["navigation"] as const,
  menu: () => ["navigation", "menu"] as const,
  permissions: () => ["navigation", "permissions"] as const,
};

/** Ecosystem — Recycle Bin */
const recycleBin = {
  all: ["recycle-bin"] as const,
  items: (params?: Record<string, unknown>) => ["recycle-bin", "items", params ?? {}] as const,
};

/** Home — Overview */
const overview = {
  all: ["overview"] as const,
  stats: () => ["overview", "stats"] as const,
  realtime: () => ["overview", "realtime"] as const,
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * `qk` — Query Keys registry (short alias for ergonomics)
 *
 * @example
 * import { qk } from '@core/common/query-keys';
 * queryKey: qk.admins.list({ tenantId })
 */
export const qk = {
  // Auth
  auth,

  // Identity
  admins,
  roles,
  tenants,
  users,
  userGroups,
  permissions,
  identityProviders,
  oauthApps,

  // Entitlements
  editions,
  features,
  subscriptions,
  overrides,
  paymentGateways,
  tenantGateways,
  tenantPlans,
  userSubscriptions,
  billing,
  commissions,
  entitlementsAnalytics,

  // Plugins
  pluginsCatalog,
  pluginsInstalled,
  pluginsDefinitions,

  // Messaging
  webhooks,
  messageTemplates,
  notifications,
  emailComposer,

  // Marketplace
  marketplaceListings,
  marketplaceCategories,
  marketplaceDevelopers,
  marketplaceReviews,
  marketplaceSubmissions,
  marketplaceFinancials,

  // Monitoring
  auditLogs,
  securityDashboard,
  monitoringAnalytics,
  monitoringDashboard,

  // Compliance
  complianceConsent,
  complianceDsr,
  complianceReports,
  complianceRetention,
  complianceRegulations,
  complianceInventory,
  complianceDashboard,

  // Customization
  branding,
  menus,
  tenantSettings,

  // Profile & Navigation
  profile,
  navigation,

  // Ecosystem
  recycleBin,
  overview,
};

// Backwards-compatible named export (used by existing code referencing `queryKeys`)
export const queryKeys = qk;

/**
 * Helper to create a new domain key set for any custom domain
 * @example
 * const ordersKeys = createDomainKeys('orders');
 */
export function createDomainKeys<T extends string>(domainName: T) {
  return domain(domainName);
}

/** Type for query key arrays */
export type QueryKey = readonly unknown[];
