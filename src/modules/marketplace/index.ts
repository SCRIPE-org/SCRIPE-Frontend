/**
 * Marketplace Module Public Exports
 *
 * Sub-module views — import these into route page.tsx files.
 * Only views and entities are exported. Repositories and services
 * are internal — accessed only via di.ts.
 */

// ── Sub-module Views ─────────────────────────────────────────────────────────
export { AppListingsView } from "./app-listings/src/presentation/views/AppListingsView";
export { CategoriesView } from "./categories/src/presentation/views/CategoriesView";
export { SubmissionsView } from "./submissions/src/presentation/views/SubmissionsView";
export { DevelopersView } from "./developers/src/presentation/views/DevelopersView";
export { ReviewsView } from "./reviews/src/presentation/views/ReviewsView";
export { FinancialsView } from "./financials/src/presentation/views/FinancialsView";

// ── Domain Entities (shared) ─────────────────────────────────────────────────
export { AppListing } from "./app-listings/src/domain/entities/AppListing";
export type { AppListingData } from "./app-listings/src/domain/entities/AppListing";
export { AppCategory } from "./categories/src/domain/entities/AppCategory";
export type { AppCategoryData } from "./categories/src/domain/entities/AppCategory";
export { AppSubmission } from "./submissions/src/domain/entities/AppSubmission";
export type { AppSubmissionData } from "./submissions/src/domain/entities/AppSubmission";
export { DeveloperProfile } from "./developers/src/domain/entities/DeveloperProfile";
export type { DeveloperProfileData } from "./developers/src/domain/entities/DeveloperProfile";
export { AppReview } from "./reviews/src/domain/entities/AppReview";
export type { AppReviewData } from "./reviews/src/domain/entities/AppReview";
export { AppPurchase, DeveloperPayout } from "./financials/src/domain/entities/FinancialEntities";
export type { AppPurchaseData, DeveloperPayoutData, PayoutStatus } from "./financials/src/domain/entities/FinancialEntities";

// ── DI Container ─────────────────────────────────────────────────────────────
export { marketplaceContainer } from "./di";
