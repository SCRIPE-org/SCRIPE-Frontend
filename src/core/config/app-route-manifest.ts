/**
 * Authoritative Route Existence Manifest (Single Source of Truth)
 *
 * Inventories all concrete Next.js App Router pages (`src/app/<routes>/page.tsx`) and
 * defines each route's authorization binding model so RouteGuard, PermissionProvider,
 * routeSlice, and proxy enforce consistent, fail-closed route security:
 *
 *  - "public":              Accessible without authentication (still blocked in prod if `devOnly`).
 *  - "shell_authenticated": True application shell / account / auth-lifecycle routes not bound
 *                           to a specific module MenuItem. Exact entries only — NO module prefixes.
 *  - "menu_bound":          Module routes governed by backend `/menus/navigation/routes`
 *                           (allRoutes + routeDescriptors) and PAGE_PERMISSIONS.
 */

export type ManifestRouteBinding = "public" | "shell_authenticated" | "menu_bound";

export interface AppRouteManifestEntry {
  /** Next.js App Router template pattern (e.g., "/roles", "/roles/[id]") */
  pattern: string;
  /** Route security classification */
  binding: ManifestRouteBinding;
  /**
   * Canonical backend MenuItem route key in `/menus/navigation/routes`.
   * Child, create, edit, and detail routes map to their owning MenuItem route.
   */
  menuRouteKey?: string;
  /** True when the route explicitly requires an active tenant context. */
  requiresTenantContext?: boolean;
  /** True when the route must never be publicly/anonymously exposed in production. */
  devOnly?: boolean;
}

/**
 * Normalize a pathname by stripping query strings, hash fragments, collapsing duplicate slashes,
 * and removing trailing slashes (except root "/"). Preserves segment casing for dynamic params.
 */
export function normalizeRoutePath(rawPath: string): string {
  if (!rawPath) return "/";
  const withoutQueryOrHash = rawPath.split(/[?#]/)[0]?.trim() ?? "";
  if (!withoutQueryOrHash) return "/";
  const prefixed = withoutQueryOrHash.startsWith("/")
    ? withoutQueryOrHash
    : `/${withoutQueryOrHash}`;
  const collapsed = prefixed.replace(/\/+/g, "/");
  if (collapsed.length > 1 && collapsed.endsWith("/")) {
    return collapsed.replace(/\/+$/, "") || "/";
  }
  return collapsed;
}

/**
 * Match a concrete pathname against a Next.js App Router template pattern.
 * Supports static segments, single dynamic segments (`[id]`), and trailing catch-all (`[...slug]`).
 */
export function matchesManifestPattern(pathname: string, pattern: string): boolean {
  const normalizedPath = normalizeRoutePath(pathname);
  const normalizedPattern = normalizeRoutePath(pattern);

  if (normalizedPath === normalizedPattern) return true;

  const pathSegs = normalizedPath.split("/").filter(Boolean);
  const patternSegs = normalizedPattern.split("/").filter(Boolean);

  for (let i = 0; i < patternSegs.length; i++) {
    const patternSeg = patternSegs[i];

    // Optional catch-all `[[...slug]]`
    if (
      patternSeg.startsWith("[[...") &&
      patternSeg.endsWith("]]") &&
      i === patternSegs.length - 1
    ) {
      return true;
    }

    // Required catch-all `[...slug]` — requires at least 1 remaining path segment
    if (
      patternSeg.startsWith("[...") &&
      patternSeg.endsWith("]") &&
      i === patternSegs.length - 1
    ) {
      return pathSegs.length >= i + 1;
    }

    if (i >= pathSegs.length) {
      return false;
    }

    if (patternSeg.startsWith("[") && patternSeg.endsWith("]")) {
      continue;
    }

    if (patternSeg !== pathSegs[i]) {
      return false;
    }
  }

  return pathSegs.length === patternSegs.length;
}

/**
 * Complete inventory of all 192 App Router `page.tsx` routes.
 */
export const APP_ROUTE_MANIFEST: readonly AppRouteManifestEntry[] = [
  // ── Public Routes (16) ────────────────────────────────────────────────────
  { pattern: "/login", binding: "public" },
  { pattern: "/forgot-password", binding: "public" },
  { pattern: "/reset-password", binding: "public" },
  { pattern: "/setup-account", binding: "public" },
  { pattern: "/signup", binding: "public" },
  { pattern: "/signup/complete", binding: "public" },
  { pattern: "/signup/finalize", binding: "public" },
  { pattern: "/terms", binding: "public" },
  { pattern: "/privacy", binding: "public" },
  { pattern: "/not-authorized", binding: "public" },
  { pattern: "/magic-link", binding: "public" },
  { pattern: "/qr-approve", binding: "public" },
  { pattern: "/sso/callback", binding: "public" },
  { pattern: "/sso/saml/callback", binding: "public" },
  { pattern: "/bookings/guest", binding: "public" },
  { pattern: "/authorize", binding: "public" },

  // ── Shell Authenticated Routes (17 — NO module prefixes!) ─────────────────
  { pattern: "/", binding: "shell_authenticated" },
  { pattern: "/hub", binding: "shell_authenticated" },
  { pattern: "/overview", binding: "shell_authenticated" },
  { pattern: "/activate-workspace", binding: "shell_authenticated" },
  { pattern: "/change-password", binding: "shell_authenticated" },
  { pattern: "/settings", binding: "shell_authenticated" },
  { pattern: "/sileo-playground", binding: "shell_authenticated", devOnly: true },
  { pattern: "/account", binding: "shell_authenticated" },
  { pattern: "/account/activity", binding: "shell_authenticated" },
  { pattern: "/account/dossier", binding: "shell_authenticated" },
  { pattern: "/account/governance", binding: "shell_authenticated" },
  { pattern: "/account/integrations", binding: "shell_authenticated" },
  { pattern: "/account/integrations/new", binding: "shell_authenticated" },
  { pattern: "/account/integrations/[id]", binding: "shell_authenticated" },
  { pattern: "/account/notifications", binding: "shell_authenticated" },
  { pattern: "/account/plan", binding: "shell_authenticated" },
  { pattern: "/account/preferences", binding: "shell_authenticated" },
  { pattern: "/account/security", binding: "shell_authenticated" },
  { pattern: "/account/sessions", binding: "shell_authenticated" },

  // ── Menu-Bound Module Routes (159) ────────────────────────────────────────
  // Identity & Admin Workspace
  { pattern: "/admins", binding: "menu_bound", menuRouteKey: "/admins" },
  { pattern: "/analytics", binding: "menu_bound", menuRouteKey: "/analytics" },
  { pattern: "/analytics/events", binding: "menu_bound", menuRouteKey: "/analytics/events" },
  { pattern: "/audit", binding: "menu_bound", menuRouteKey: "/audit" },
  { pattern: "/dashboard", binding: "menu_bound", menuRouteKey: "/overview" },
  { pattern: "/domains", binding: "menu_bound", menuRouteKey: "/domains", requiresTenantContext: true },
  { pattern: "/media", binding: "menu_bound", menuRouteKey: "/media" },
  { pattern: "/platform-health", binding: "menu_bound", menuRouteKey: "/platform-health" },
  { pattern: "/recycle-bin", binding: "menu_bound", menuRouteKey: "/recycle-bin" },
  { pattern: "/roles", binding: "menu_bound", menuRouteKey: "/roles" },
  { pattern: "/roles/[id]", binding: "menu_bound", menuRouteKey: "/roles" },
  { pattern: "/security", binding: "menu_bound", menuRouteKey: "/security" },
  { pattern: "/tenants", binding: "menu_bound", menuRouteKey: "/tenants" },
  { pattern: "/tenants/create", binding: "menu_bound", menuRouteKey: "/tenants" },
  { pattern: "/tenants/[id]", binding: "menu_bound", menuRouteKey: "/tenants" },
  { pattern: "/user-groups", binding: "menu_bound", menuRouteKey: "/user-groups" },
  { pattern: "/user-groups/[id]", binding: "menu_bound", menuRouteKey: "/user-groups" },
  { pattern: "/users", binding: "menu_bound", menuRouteKey: "/users", requiresTenantContext: true },
  { pattern: "/settings/permissions", binding: "menu_bound", menuRouteKey: "/settings/permissions" },
  { pattern: "/settings/identity-providers", binding: "menu_bound", menuRouteKey: "/settings/identity-providers" },
  { pattern: "/settings/identity-providers/create", binding: "menu_bound", menuRouteKey: "/settings/identity-providers" },
  { pattern: "/settings/identity-providers/[id]", binding: "menu_bound", menuRouteKey: "/settings/identity-providers" },
  { pattern: "/settings/oauth-apps", binding: "menu_bound", menuRouteKey: "/settings/oauth-apps" },
  { pattern: "/settings/oauth-apps/create", binding: "menu_bound", menuRouteKey: "/settings/oauth-apps" },
  { pattern: "/settings/oauth-apps/[id]", binding: "menu_bound", menuRouteKey: "/settings/oauth-apps" },

  // Communication
  { pattern: "/communication/message-composer", binding: "menu_bound", menuRouteKey: "/communication/message-composer" },
  { pattern: "/communication/notifications", binding: "menu_bound", menuRouteKey: "/communication/notifications" },
  { pattern: "/communication/templates", binding: "menu_bound", menuRouteKey: "/communication/templates" },
  { pattern: "/communication/templates/new", binding: "menu_bound", menuRouteKey: "/communication/templates" },
  { pattern: "/communication/templates/[id]/edit", binding: "menu_bound", menuRouteKey: "/communication/templates" },

  // Compliance
  { pattern: "/compliance", binding: "menu_bound", menuRouteKey: "/compliance" },
  { pattern: "/compliance/consent", binding: "menu_bound", menuRouteKey: "/compliance/consent" },
  { pattern: "/compliance/data-inventory", binding: "menu_bound", menuRouteKey: "/compliance/data-inventory" },
  { pattern: "/compliance/dsr", binding: "menu_bound", menuRouteKey: "/compliance/dsr" },
  { pattern: "/compliance/dsr/[id]", binding: "menu_bound", menuRouteKey: "/compliance/dsr" },
  { pattern: "/compliance/regulations", binding: "menu_bound", menuRouteKey: "/compliance/regulations" },
  { pattern: "/compliance/reports", binding: "menu_bound", menuRouteKey: "/compliance/reports" },
  { pattern: "/compliance/reports/[id]", binding: "menu_bound", menuRouteKey: "/compliance/reports" },
  { pattern: "/compliance/retention", binding: "menu_bound", menuRouteKey: "/compliance/retention" },

  // CRM
  { pattern: "/crm", binding: "menu_bound", menuRouteKey: "/crm" },
  { pattern: "/crm/accounts", binding: "menu_bound", menuRouteKey: "/crm/accounts" },
  { pattern: "/crm/accounts/[id]", binding: "menu_bound", menuRouteKey: "/crm/accounts" },
  { pattern: "/crm/activities", binding: "menu_bound", menuRouteKey: "/crm/activities" },
  { pattern: "/crm/contacts", binding: "menu_bound", menuRouteKey: "/crm/contacts" },
  { pattern: "/crm/contacts/[id]", binding: "menu_bound", menuRouteKey: "/crm/contacts" },
  { pattern: "/crm/leads", binding: "menu_bound", menuRouteKey: "/crm/leads" },
  { pattern: "/crm/leads/[id]", binding: "menu_bound", menuRouteKey: "/crm/leads" },
  { pattern: "/crm/opportunities", binding: "menu_bound", menuRouteKey: "/crm/opportunities" },
  { pattern: "/crm/opportunities/[id]", binding: "menu_bound", menuRouteKey: "/crm/opportunities" },
  { pattern: "/crm/pipelines", binding: "menu_bound", menuRouteKey: "/crm/pipelines" },
  { pattern: "/crm/reports", binding: "menu_bound", menuRouteKey: "/crm/reports" },
  { pattern: "/crm/settings", binding: "menu_bound", menuRouteKey: "/crm/settings" },

  // Custom Fields
  { pattern: "/custom-fields", binding: "menu_bound", menuRouteKey: "/custom-fields" },
  { pattern: "/custom-fields/entity-types", binding: "menu_bound", menuRouteKey: "/custom-fields/entity-types" },
  { pattern: "/custom-fields/field-groups", binding: "menu_bound", menuRouteKey: "/custom-fields/field-groups" },
  { pattern: "/custom-fields/option-sets", binding: "menu_bound", menuRouteKey: "/custom-fields/option-sets" },
  { pattern: "/custom-fields/security", binding: "menu_bound", menuRouteKey: "/custom-fields" },
  { pattern: "/custom-fields/value-types", binding: "menu_bound", menuRouteKey: "/custom-fields/value-types" },

  // Customization & Studio
  { pattern: "/customization/branding", binding: "menu_bound", menuRouteKey: "/customization/branding", requiresTenantContext: true },
  { pattern: "/customization/gallery", binding: "menu_bound", menuRouteKey: "/customization/gallery" },
  { pattern: "/customization/menus", binding: "menu_bound", menuRouteKey: "/customization/menus" },
  { pattern: "/customization/menus/customize", binding: "menu_bound", menuRouteKey: "/customization/menus" },
  { pattern: "/customization/themes", binding: "menu_bound", menuRouteKey: "/customization/themes" },
  { pattern: "/customizer", binding: "menu_bound", menuRouteKey: "/customizer", requiresTenantContext: true },
  { pattern: "/dashboard-preview", binding: "menu_bound", menuRouteKey: "/customizer" },
  { pattern: "/studio-preview", binding: "menu_bound", menuRouteKey: "/customizer" },

  // Data Exchange (Tenant Context Required)
  { pattern: "/data-exchange", binding: "menu_bound", menuRouteKey: "/data-exchange", requiresTenantContext: true },
  { pattern: "/data-exchange/jobs", binding: "menu_bound", menuRouteKey: "/data-exchange/jobs", requiresTenantContext: true },
  { pattern: "/data-exchange/presets", binding: "menu_bound", menuRouteKey: "/data-exchange/presets", requiresTenantContext: true },

  // Billing, Payments & Entitlements
  { pattern: "/entitlements/analytics", binding: "menu_bound", menuRouteKey: "/entitlements/analytics" },
  { pattern: "/entitlements/billing-hub", binding: "menu_bound", menuRouteKey: "/entitlements/billing-hub" },
  { pattern: "/entitlements/commission-invoices", binding: "menu_bound", menuRouteKey: "/entitlements/commission-invoices" },
  { pattern: "/entitlements/commission-ledger", binding: "menu_bound", menuRouteKey: "/entitlements/commission-ledger" },
  { pattern: "/entitlements/commissions", binding: "menu_bound", menuRouteKey: "/entitlements/commissions" },
  { pattern: "/entitlements/edition-categories", binding: "menu_bound", menuRouteKey: "/entitlements/edition-categories" },
  { pattern: "/entitlements/editions", binding: "menu_bound", menuRouteKey: "/entitlements/editions" },
  { pattern: "/entitlements/editions/compare", binding: "menu_bound", menuRouteKey: "/entitlements/editions" },
  { pattern: "/entitlements/editions/create", binding: "menu_bound", menuRouteKey: "/entitlements/editions" },
  { pattern: "/entitlements/editions/[id]", binding: "menu_bound", menuRouteKey: "/entitlements/editions" },
  { pattern: "/entitlements/editions/[id]/edit", binding: "menu_bound", menuRouteKey: "/entitlements/editions" },
  { pattern: "/entitlements/editions/[id]/overview", binding: "menu_bound", menuRouteKey: "/entitlements/editions" },
  { pattern: "/entitlements/features", binding: "menu_bound", menuRouteKey: "/entitlements/features" },
  { pattern: "/entitlements/invoices", binding: "menu_bound", menuRouteKey: "/entitlements/invoices" },
  { pattern: "/entitlements/onboarding/questions", binding: "menu_bound", menuRouteKey: "/entitlements/onboarding/questions" },
  { pattern: "/entitlements/onboarding/rules", binding: "menu_bound", menuRouteKey: "/entitlements/onboarding/rules" },
  { pattern: "/entitlements/overrides/[tenantId]", binding: "menu_bound", menuRouteKey: "/tenants" },
  { pattern: "/entitlements/payouts", binding: "menu_bound", menuRouteKey: "/entitlements/payouts", requiresTenantContext: true },
  { pattern: "/entitlements/platform-stripe", binding: "menu_bound", menuRouteKey: "/entitlements/platform-stripe" },
  { pattern: "/entitlements/signup-content", binding: "menu_bound", menuRouteKey: "/entitlements/onboarding/questions" },
  { pattern: "/entitlements/subscriptions/[tenantId]", binding: "menu_bound", menuRouteKey: "/tenants" },
  { pattern: "/entitlements/tenant-feature-definitions", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-feature-definitions", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-feature-definitions/create", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-feature-definitions", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-feature-definitions/[id]", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-feature-definitions", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-feature-definitions/[id]/edit", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-feature-definitions", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-plans", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-plans", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-plans/compare", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-plans", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-plans/create", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-plans", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-plans/[id]", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-plans", requiresTenantContext: true },
  { pattern: "/entitlements/tenant-plans/[id]/edit", binding: "menu_bound", menuRouteKey: "/entitlements/tenant-plans", requiresTenantContext: true },
  { pattern: "/entitlements/user-subscriptions", binding: "menu_bound", menuRouteKey: "/entitlements/user-subscriptions", requiresTenantContext: true },
  { pattern: "/my-payment-methods", binding: "menu_bound", menuRouteKey: "/my-payment-methods", requiresTenantContext: true },
  { pattern: "/my-plan", binding: "menu_bound", menuRouteKey: "/my-plan", requiresTenantContext: true },
  { pattern: "/my-stripe-account", binding: "menu_bound", menuRouteKey: "/my-stripe-account", requiresTenantContext: true },
  { pattern: "/my-subscription", binding: "menu_bound", menuRouteKey: "/my-subscription", requiresTenantContext: true },
  { pattern: "/payment-gateways", binding: "menu_bound", menuRouteKey: "/payment-gateways" },

  // HRMS & Work Management
  { pattern: "/hrms", binding: "menu_bound", menuRouteKey: "/hrms" },
  { pattern: "/hrms/certifications", binding: "menu_bound", menuRouteKey: "/hrms/certifications" },
  { pattern: "/hrms/employment-records", binding: "menu_bound", menuRouteKey: "/hrms/employment-records" },
  { pattern: "/hrms/qualifications", binding: "menu_bound", menuRouteKey: "/hrms/qualifications" },
  { pattern: "/hrms/staff-assignments", binding: "menu_bound", menuRouteKey: "/hrms/staff-assignments" },
  { pattern: "/hrms/staff-availabilities", binding: "menu_bound", menuRouteKey: "/hrms/staff-availabilities" },
  { pattern: "/hrms/staff-competencies", binding: "menu_bound", menuRouteKey: "/hrms/staff-competencies" },
  { pattern: "/hrms/staff-members", binding: "menu_bound", menuRouteKey: "/hrms/staff-members" },
  { pattern: "/work-items", binding: "menu_bound", menuRouteKey: "/work-items" },

  // Integrations
  { pattern: "/integrations/apikeys", binding: "menu_bound", menuRouteKey: "/integrations/apikeys", requiresTenantContext: true },
  { pattern: "/integrations/apikeys/[id]", binding: "menu_bound", menuRouteKey: "/integrations/apikeys", requiresTenantContext: true },
  { pattern: "/integrations/webhooks", binding: "menu_bound", menuRouteKey: "/integrations/webhooks" },
  { pattern: "/integrations/webhooks/[id]", binding: "menu_bound", menuRouteKey: "/integrations/webhooks" },

  // Marketplace
  { pattern: "/marketplace", binding: "menu_bound", menuRouteKey: "/marketplace" },
  { pattern: "/marketplace/categories", binding: "menu_bound", menuRouteKey: "/marketplace/categories" },
  { pattern: "/marketplace/developers", binding: "menu_bound", menuRouteKey: "/marketplace/developers" },
  { pattern: "/marketplace/financials", binding: "menu_bound", menuRouteKey: "/marketplace/financials" },
  { pattern: "/marketplace/my-earnings", binding: "menu_bound", menuRouteKey: "/marketplace/my-earnings", requiresTenantContext: true },
  { pattern: "/marketplace/my-profile", binding: "menu_bound", menuRouteKey: "/marketplace/my-profile", requiresTenantContext: true },
  { pattern: "/marketplace/my-submissions", binding: "menu_bound", menuRouteKey: "/marketplace/my-submissions", requiresTenantContext: true },
  { pattern: "/marketplace/reviews", binding: "menu_bound", menuRouteKey: "/marketplace/reviews" },
  { pattern: "/marketplace/submissions", binding: "menu_bound", menuRouteKey: "/marketplace/submissions" },
  { pattern: "/marketplace/[id]", binding: "menu_bound", menuRouteKey: "/marketplace" },

  // Party Kernel
  { pattern: "/party-kernel", binding: "menu_bound", menuRouteKey: "/party-kernel" },
  { pattern: "/party-kernel/contact-points", binding: "menu_bound", menuRouteKey: "/party-kernel" },
  { pattern: "/party-kernel/merge-candidates", binding: "menu_bound", menuRouteKey: "/party-kernel" },
  { pattern: "/party-kernel/parties", binding: "menu_bound", menuRouteKey: "/party-kernel/parties" },
  { pattern: "/party-kernel/parties/[id]", binding: "menu_bound", menuRouteKey: "/party-kernel/parties" },
  { pattern: "/party-kernel/party-organizations", binding: "menu_bound", menuRouteKey: "/party-kernel" },
  { pattern: "/party-kernel/party-people", binding: "menu_bound", menuRouteKey: "/party-kernel" },
  { pattern: "/party-kernel/party-relationships", binding: "menu_bound", menuRouteKey: "/party-kernel" },
  { pattern: "/party-kernel/party-roles", binding: "menu_bound", menuRouteKey: "/party-kernel" },

  // Plugins
  { pattern: "/plugins/catalog", binding: "menu_bound", menuRouteKey: "/plugins/catalog", requiresTenantContext: true },
  { pattern: "/plugins/definitions", binding: "menu_bound", menuRouteKey: "/plugins/definitions" },
  { pattern: "/plugins/installed", binding: "menu_bound", menuRouteKey: "/plugins/installed", requiresTenantContext: true },
  { pattern: "/plugins/logs", binding: "menu_bound", menuRouteKey: "/plugins/logs" },
  { pattern: "/plugins/[installationId]", binding: "menu_bound", menuRouteKey: "/plugins/installed", requiresTenantContext: true },
  { pattern: "/plugins/[installationId]/logs", binding: "menu_bound", menuRouteKey: "/plugins/installed", requiresTenantContext: true },
  { pattern: "/plugins/[installationId]/settings", binding: "menu_bound", menuRouteKey: "/plugins/installed", requiresTenantContext: true },

  // Venue Operations
  { pattern: "/venue", binding: "menu_bound", menuRouteKey: "/venue" },
  { pattern: "/venue/attention", binding: "menu_bound", menuRouteKey: "/venue/attention" },
  { pattern: "/venue/bookings/new", binding: "menu_bound", menuRouteKey: "/venue/bookings/new" },
  { pattern: "/venue/bookings/[reservationId]", binding: "menu_bound", menuRouteKey: "/venue/calendar" },
  { pattern: "/venue/calendar", binding: "menu_bound", menuRouteKey: "/venue/calendar" },
  { pattern: "/venue/customers", binding: "menu_bound", menuRouteKey: "/venue/customers" },
  { pattern: "/venue/facilities", binding: "menu_bound", menuRouteKey: "/venue/facilities" },
  { pattern: "/venue/money", binding: "menu_bound", menuRouteKey: "/venue/money" },
  { pattern: "/venue/money/payments", binding: "menu_bound", menuRouteKey: "/venue/money/payments" },
  { pattern: "/venue/money/receivables", binding: "menu_bound", menuRouteKey: "/venue/money/receivables" },
  { pattern: "/venue/pricing", binding: "menu_bound", menuRouteKey: "/venue/pricing" },
  { pattern: "/venue/reports", binding: "menu_bound", menuRouteKey: "/venue/reports" },
  { pattern: "/venue/resources", binding: "menu_bound", menuRouteKey: "/venue/resources" },
  { pattern: "/venue/resources/[id]", binding: "menu_bound", menuRouteKey: "/venue/resources" },
  { pattern: "/venue/settings", binding: "menu_bound", menuRouteKey: "/venue/settings" },
] as const;

const EXACT_MANIFEST_MAP = new Map<string, AppRouteManifestEntry>();
const STATIC_SEGMENT_PREFIX_ENTRIES: AppRouteManifestEntry[] = [];
const DYNAMIC_ENTRIES: AppRouteManifestEntry[] = [];
const CATCH_ALL_ENTRIES: AppRouteManifestEntry[] = [];

for (const entry of APP_ROUTE_MANIFEST) {
  const normalized = normalizeRoutePath(entry.pattern);
  EXACT_MANIFEST_MAP.set(normalized, entry);
  if (normalized.includes("[...")) {
    CATCH_ALL_ENTRIES.push(entry);
  } else if (normalized.includes("[")) {
    DYNAMIC_ENTRIES.push(entry);
  } else {
    STATIC_SEGMENT_PREFIX_ENTRIES.push(entry);
  }
}

// Sort dynamic entries by specificity: more literal segments first, then longer patterns
DYNAMIC_ENTRIES.sort((a, b) => {
  const aSegs = a.pattern.split("/").filter(Boolean);
  const bSegs = b.pattern.split("/").filter(Boolean);
  const aLiterals = aSegs.filter((s) => !s.startsWith("[")).length;
  const bLiterals = bSegs.filter((s) => !s.startsWith("[")).length;
  if (bLiterals !== aLiterals) return bLiterals - aLiterals;
  return b.pattern.length - a.pattern.length;
});

CATCH_ALL_ENTRIES.sort((a, b) => b.pattern.length - a.pattern.length);

/**
 * Resolve a concrete URL pathname against APP_ROUTE_MANIFEST.
 * Matches exact static routes first, then single-param dynamic routes by literal specificity,
 * then catch-all routes. Returns `null` for unknown routes (caller should render 404).
 */
export function matchAppRoute(pathname: string): AppRouteManifestEntry | null {
  const normalized = normalizeRoutePath(pathname);

  const exact = EXACT_MANIFEST_MAP.get(normalized);
  if (exact) return exact;

  for (const entry of DYNAMIC_ENTRIES) {
    if (matchesManifestPattern(normalized, entry.pattern)) {
      return entry;
    }
  }

  for (const entry of CATCH_ALL_ENTRIES) {
    if (matchesManifestPattern(normalized, entry.pattern)) {
      return entry;
    }
  }

  return null;
}

/**
 * True when the route is explicitly declared public in APP_ROUTE_MANIFEST
 * and not disabled in production (`devOnly`).
 */
export function isManifestPublicRoute(
  pathname: string,
  nodeEnv: string | undefined = process.env.NODE_ENV
): boolean {
  const entry = matchAppRoute(pathname);
  if (!entry || entry.binding !== "public") return false;
  if (entry.devOnly && nodeEnv === "production") return false;
  return true;
}

/**
 * True when the route is declared as a shell-authenticated route (never module prefixes)
 * and not disabled in production (`devOnly`).
 */
export function isManifestShellRoute(
  pathname: string,
  nodeEnv: string | undefined = process.env.NODE_ENV
): boolean {
  const entry = matchAppRoute(pathname);
  if (!entry || entry.binding !== "shell_authenticated") return false;
  if (entry.devOnly && nodeEnv === "production") return false;
  return true;
}

export const MANIFEST_PUBLIC_PATTERNS = APP_ROUTE_MANIFEST.filter(
  (e) => e.binding === "public"
).map((e) => e.pattern);

export const MANIFEST_STATIC_PREFIX_COUNT = STATIC_SEGMENT_PREFIX_ENTRIES.length;
