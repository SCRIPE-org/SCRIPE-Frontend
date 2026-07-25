/**
 * Marketplace — App Listings sub-module locale (English)
 *
 * Also includes shared keys (nav titles, CRUD actions, toasts)
 * that are used across multiple marketplace sub-modules.
 */
export const en = {
  marketplace: {
    title: "Marketplace",
    description: "Manage Marketplace",
    appListings: "App Listings",
    categories: "Categories",
    submissions: "Submissions",
    developers: "Developers",
    reviews: {
      deleted: "Review deleted successfully",
    },
    financials: "Financials",
    addNew: "Add Listing",
    editTitle: "Edit Listing",
    deleteTitle: "Delete Listing",
    deleteConfirm: "Are you sure you want to delete this listing?",
    noItems: "No listings found",
    searchPlaceholder: "Search listings...",
    columns: {
      name: "Name",
      status: "Status",
      createdAt: "Created",
      updatedAt: "Updated",
    },
    form: {
      name: "Name",
      namePlaceholder: "Enter name",
    },
    toast: {
      created: "Created successfully",
      updated: "Updated successfully",
      deleted: "Deleted successfully",
      error: "An error occurred",
    },
    listingsEmpty: "No app listings found.",
    listingsError: "Failed to load app listings.",
    browseApps: "Browse Apps",
    featuredApps: "Featured Apps",
    allApps: "All Apps",
    listings: {
      published: "App published successfully",
      unpublished: "App unpublished successfully",
      featuredToggled: "Featured status updated",
      deleted: "Listing deleted successfully",
    },
    // ── AppListingsView ──
    listingsNoResultsTitle: "No listings found",
    listingsNoResultsHint: "Try adjusting your filters",
    listingsTotalCount: "{{count}} listings total",
    listingsPageIndicator: "Page {{page}} of {{total}}",
    // ── AppListingCard ──
    listingsFeaturedBadge: "Featured",
    listingsViewDetails: "Details",
    listingsPublishAction: "Publish",
    listingsUnpublishAction: "Unpublish",
    listingsMarkFeatured: "Mark as featured",
    listingsRemoveFeatured: "Remove from featured",
    listingsDeleteAction: "Delete listing",
    // ── AppListingsStats ──
    statsTotalListings: "Total Listings",
    statsPublished: "Published",
    statsDrafts: "Drafts",
    // ── AppListingsToolbar ──
    toolbarSortByPlaceholder: "Sort by",
    toolbarSortNewest: "Newest",
    toolbarSortPopular: "Most Popular",
    toolbarSortRating: "Top Rated",
    toolbarSortPrice: "Price",
    toolbarPricingPlaceholder: "Pricing model",
    toolbarPricingAll: "All Pricing",
    toolbarPricingOneTime: "One-time",
    toolbarPricingSubscription: "Subscription",
    // ── AppDetailView ──
    detailBackToListings: "Back to App Listings",
    detailFailedToLoad: "Failed to load app listing.",
    detailAboutApp: "About this app",
    detailPricingTitle: "Pricing",
    detailBilledAnnually: "Billed annually",
    detailBilledMonthly: "Billed monthly",
    detailNoCost: "No cost to install",
    detailModel: "Model",
    detailCurrency: "Currency",
    detailReviewsTab: "Reviews",
    detailNoReviewsYet: "No reviews yet.",
    detailModerateReview: "Moderate (delete) this review",
    detailReviewDeleteConfirmDesc:
      "Are you sure you want to delete this review? This action cannot be undone.",
    detailVersionLabel: "Version",
    detailCategoryLabel: "Category",
    detailDeveloperLabel: "Developer",
    detailRatingLabel: "Rating",
    detailReviewCountLabel: "Review Count",
    detailPrevScreenshot: "Previous screenshot",
    detailNextScreenshot: "Next screenshot",
    detailScreenshotAlt: "Screenshot {{count}}",
    detailFeatureAction: "Feature",
    detailUnfeatureAction: "Unfeature",
    detailTitle: "App Detail",
    // ── Vendor self-service (My Earnings / My Profile / My Submissions) ──
    // These three routes have no backing admin sub-module yet, so their
    // copy lives here alongside the other shared marketplace-wide keys.
    vendor: {
      earningsTitle: "My Earnings",
      earningsDescription: "View your sales reports, pending payouts, and download tax documents.",
      earningsFeatureReports: "Sales and revenue reports",
      earningsFeaturePayouts: "Pending and completed payouts",
      earningsFeatureTax: "Downloadable tax documents",
      profileTitle: "My Profile",
      profileDescription: "Manage your organization details, API keys, and vendor identity.",
      profileFeatureOrg: "Organization details and branding",
      profileFeatureApiKeys: "API keys for marketplace integrations",
      profileFeatureIdentity: "Verified vendor identity",
      submissionsTitle: "My Submissions",
      submissionsDescription:
        "Track your app submission statuses, upload new versions, and view reviewer feedback.",
      submissionsFeatureStatus: "Submission status tracking",
      submissionsFeatureVersions: "New version uploads",
      submissionsFeatureFeedback: "Reviewer feedback and revision requests",
    },
  },
};
