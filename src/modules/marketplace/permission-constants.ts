/**
 * Marketplace Module Permissions
 *
 * Covers: App Listings, Submissions, Developer Profiles,
 * Reviews, Purchases, Payouts
 */
export const MARKETPLACE_PERMISSIONS = {
  // ── App Listings ────────────────────────────────────────
  APP_LISTINGS_VIEW: "applistings.view",
  APP_LISTINGS_CREATE: "applistings.create",
  APP_LISTINGS_UPDATE: "applistings.update",
  APP_LISTINGS_DELETE: "applistings.delete",

  // ── App Submissions ────────────────────────────────────
  APP_SUBMISSIONS_VIEW: "appsubmissions.view",
  APP_SUBMISSIONS_CREATE: "appsubmissions.create",
  APP_SUBMISSIONS_UPDATE: "appsubmissions.update",

  // ── Developer Profiles ─────────────────────────────────
  DEVELOPER_PROFILES_VIEW: "developerprofiles.view",
  DEVELOPER_PROFILES_CREATE: "developerprofiles.create",
  DEVELOPER_PROFILES_UPDATE: "developerprofiles.update",
  DEVELOPER_PROFILES_VERIFY: "developerprofiles.verify",

  // ── App Reviews ────────────────────────────────────────
  APP_REVIEWS_VIEW: "appreviews.view",
  APP_REVIEWS_CREATE: "appreviews.create",
  APP_REVIEWS_DELETE: "appreviews.delete",

  // ── Financials ─────────────────────────────────────────
  APP_PURCHASES_VIEW: "apppurchases.view",
  APP_PURCHASES_CREATE: "apppurchases.create",
  DEVELOPER_PAYOUTS_VIEW: "developerpayouts.view",
  DEVELOPER_PAYOUTS_PROCESS: "developerpayouts.process",
} as const;
