import { V1 } from "./_shared";

/**
 * Marketplace module API endpoint constants.
 *
 * Maps every backend controller route to a typed constant for use in
 * data-layer services. Covers: AppCatalog, AppCategory, AppSubmission,
 * AppReview, AppFinancials, and DeveloperProfile controllers.
 */
export const MARKETPLACE_ENDPOINTS = {
  MARKETPLACE: {
    // ── App Catalog ──────────────────────────────────────────────
    /** List all app listings with search, category, and published filters */
    CATALOG: `${V1}/marketplace/catalog`,
    /** Get featured app listings for the storefront hero section */
    CATALOG_FEATURED: `${V1}/marketplace/catalog/featured`,
    /** Get a single app listing by ID */
    CATALOG_BY_ID: (id: string) => `${V1}/marketplace/catalog/${id}`,
    /** Publish an app listing (make visible in storefront) */
    CATALOG_PUBLISH: (id: string) => `${V1}/marketplace/catalog/${id}/publish`,
    /** Unpublish an app listing (hide from storefront) */
    CATALOG_UNPUBLISH: (id: string) =>
      `${V1}/marketplace/catalog/${id}/unpublish`,
    /** Toggle featured status for an app listing */
    CATALOG_FEATURE: (id: string) => `${V1}/marketplace/catalog/${id}/feature`,
    /** Set or update pricing for an app listing */
    CATALOG_PRICING: (id: string) => `${V1}/marketplace/catalog/${id}/pricing`,

    // ── App Categories ───────────────────────────────────────────
    /** List all marketplace categories */
    CATEGORIES: `${V1}/marketplace/categories`,
    /** Get a single category by ID */
    CATEGORY_BY_ID: (id: string) => `${V1}/marketplace/categories/${id}`,

    // ── App Submissions ──────────────────────────────────────────
    /** List all submissions (with optional status filter) */
    SUBMISSIONS: `${V1}/marketplace/submissions`,
    /** Get a single submission by ID */
    SUBMISSION_BY_ID: (id: string) => `${V1}/marketplace/submissions/${id}`,
    /** Approve a pending submission */
    SUBMISSION_APPROVE: (id: string) =>
      `${V1}/marketplace/submissions/${id}/approve`,
    /** Reject a pending submission with feedback */
    SUBMISSION_REJECT: (id: string) =>
      `${V1}/marketplace/submissions/${id}/reject`,
    /** Request revisions on a submission */
    SUBMISSION_REQUEST_REVISIONS: (id: string) =>
      `${V1}/marketplace/submissions/${id}/request-revisions`,

    // ── App Reviews ──────────────────────────────────────────────
    /** List reviews for an app listing */
    REVIEWS: `${V1}/marketplace/reviews`,
    /** Delete (moderate) a review */
    REVIEW_BY_ID: (id: string) => `${V1}/marketplace/reviews/${id}`,

    // ── Financials ───────────────────────────────────────────────
    /** List app purchase transactions */
    PURCHASES: `${V1}/marketplace/financials/purchases`,
    /** List developer payouts */
    PAYOUTS: `${V1}/marketplace/financials/payouts`,
    /** Process a pending developer payout */
    PAYOUT_PROCESS: (id: string) => `${V1}/marketplace/financials/payouts/${id}/process`,

    // ── Developer Profiles ───────────────────────────────────────
    /** List all developer profiles */
    DEVELOPERS: `${V1}/marketplace/developers`,
    /** Get a developer profile by ID */
    DEVELOPER_BY_ID: (id: string) => `${V1}/marketplace/developers/${id}`,
    /** Get a developer profile by tenant ID */
    DEVELOPER_BY_TENANT: (tenantId: string) =>
      `${V1}/marketplace/developers/by-tenant/${tenantId}`,
    /** Verify a developer profile (admin action) */
    DEVELOPER_VERIFY: (id: string) =>
      `${V1}/marketplace/developers/${id}/verify`,
  },
};
