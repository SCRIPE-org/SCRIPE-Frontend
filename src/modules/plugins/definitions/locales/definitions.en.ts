/**
 * Plugins — Definitions sub-module locale (English)
 *
 * Platform-admin-only sub-module for managing plugin definitions.
 * These keys live under the "plugins" namespace to merge cleanly
 * with the primary catalog sub-module keys.
 */
export const en = {
  plugins: {
    // ── Page header ──────────────────────────────────────────────────
    defTitle: "Plugin Definitions",
    defSubtitle: "Register and manage plugin definitions available on the platform.",
    defNew: "New Definition",

    // ── Definitions section ──────────────────────────────────────────
    definitions: "Plugin Definitions",
    definitionsDesc: "Register and manage plugin definitions available on the platform.",
    definitionsError: "Failed to load plugin definitions.",

    // ── Stats ────────────────────────────────────────────────────────
    defStatTotal: "Total",
    defStatPublished: "Published",
    defStatDraft: "Draft",
    defStatDeprecated: "Deprecated",

    // ── Table ────────────────────────────────────────────────────────
    defTableTitle: "All Definitions",
    defTableSubtitle: "Platform-registered plugin packages available for tenant installation.",
    defEmpty: "No plugin definitions found.",
    defEmptyHint: "Use 'New Definition' to register a plugin package.",

    // ── Table columns ────────────────────────────────────────────────
    defColKey: "Plugin Key",
    defColName: "Name",
    defColTier: "Tier",
    defColStatus: "Status",
    defColScope: "Scope",
    defColCreated: "Created",

    // ── Status labels ────────────────────────────────────────────────
    defStatusDraft: "Draft",
    defStatusPending: "Pending Review",
    defStatusApproved: "Approved",
    defStatusPublished: "Published",
    defStatusRejected: "Rejected",
    defStatusDeprecated: "Deprecated",

    // ── Scope labels ─────────────────────────────────────────────────
    defScopeGlobal: "Global",
    defScopeTenant: "Tenant",
    defScopeUser: "User",

    // ── Actions ──────────────────────────────────────────────────────
    defCreate: "New Definition",
    defEdit: "Edit Definition",
    defDelete: "Delete Definition",
    defPublish: "Publish",
    defDeprecate: "Deprecate",
    defViewManifest: "View Manifest",
  },
};
