/**
 * Plugins — Catalog sub-module locale (English)
 *
 * Also includes shared keys (nav, tiers, statuses, actions, health)
 * that are used across multiple plugin sub-modules. The catalog submodule
 * is the primary entry point so it owns the shared namespace.
 */
export const en = {
  plugins: {
    // ── Navigation / section titles (shared) ──────────────────────
    title: "Plugin System",
    catalog: "Plugin Catalog",
    installed: "Installed Plugins",
    logs: "Execution Logs",
    settings: "Plugin Settings",

    // ── Shared tier labels ───────────────────────────────────────
    tier1: "Tier 1",
    tier1Label: "Tier 1 — Certified",
    tier2: "Tier 2",
    tier2Label: "Tier 2 — Sandboxed",

    // ── Shared status labels ─────────────────────────────────────
    statusActive: "Active",
    statusDisabled: "Disabled",
    statusInstalling: "Installing",
    statusUninstalling: "Uninstalling",
    statusFailed: "Failed",
    statusUnknown: "Unknown",

    // ── Shared actions ───────────────────────────────────────────
    install: "Install",
    uninstall: "Uninstall",
    activate: "Activate",
    deactivate: "Deactivate",
    installing: "Installing...",
    retry: "Retry",
    refresh: "Refresh",

    // ── Shared health ────────────────────────────────────────────
    healthy: "Healthy",
    unhealthy: "Unhealthy",
    healthUnknown: "Health status unknown",
    lastChecked: "Last checked {{time}}",

    // ── Catalog page ─────────────────────────────────────────────
    catalogEmpty: "No plugins available in the catalog.",
    catalogError: "Failed to load plugin catalog.",
    catalogInstalled: "Installed",

    // ── Plugin card ──────────────────────────────────────────────
    cardInstall: "Install",
    cardInstalled: "Installed",
    cardInstalling: "Installing...",

    // ── Install dialog ───────────────────────────────────────────
    dialogTitle: "Install Plugin",
    dialogCancel: "Cancel",
    dialogConfirm: "Install Plugin",
    dialogInstalling: "Installing...",
    dialogTier2ConsentTitle: "Permission Consent",
    dialogTier2ConsentDesc: "This third-party plugin will receive the following access:",
    dialogTier2ConsentCheck: "I understand and consent to these permissions",
    dialogTier1Warning:
      "Tier 1 plugins run in-process and have full access to NEXORA infrastructure. Only install certified plugins from trusted sources.",

    // ── Tier 2 permission list ────────────────────────────────────
    perm1: "Read your tenant profile and feature flags",
    perm2: "Store isolated key-value data in sandbox",
    perm3: "Register webhook subscriptions for platform events",
    perm4: "Call NEXORA APIs via rate-limited gateway (60 req/min)",
  },
};
