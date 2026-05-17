/**
 * Marketplace — App Listings sub-module locale (English)
 *
 * Also includes shared keys (nav titles, CRUD actions, toasts)
 * that are used across multiple marketplace sub-modules.
 */
export const en = {
  marketplace: {
    // ── Navigation / section titles (shared) ──────────────────────
    title: "Marketplace",
    description: "Manage Marketplace",
    appListings: "App Listings",
    categories: "Categories",
    submissions: "Submissions",
    developers: "Developers",
    reviews: "Reviews",
    financials: "Financials",

    // ── Shared CRUD labels ───────────────────────────────────────
    addNew: "Add Listing",
    editTitle: "Edit Listing",
    deleteTitle: "Delete Listing",
    deleteConfirm: "Are you sure you want to delete this listing?",
    noItems: "No listings found",
    searchPlaceholder: "Search listings...",

    // ── Shared columns ───────────────────────────────────────────
    columns: {
      name: "Name",
      status: "Status",
      createdAt: "Created",
      updatedAt: "Updated",
    },

    // ── Shared form ──────────────────────────────────────────────
    form: {
      name: "Name",
      namePlaceholder: "Enter name",
    },

    // ── Shared toast ─────────────────────────────────────────────
    toast: {
      created: "Created successfully",
      updated: "Updated successfully",
      deleted: "Deleted successfully",
      error: "An error occurred",
    },

    // ── App Listings ─────────────────────────────────────────────
    listingsEmpty: "No app listings found.",
    listingsError: "Failed to load app listings.",
    browseApps: "Browse Apps",
    featuredApps: "Featured Apps",
    allApps: "All Apps",
  },
};
