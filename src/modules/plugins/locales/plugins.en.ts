/**
 * Plugins Module — Shared locale (English)
 * Keys shared across all plugin sub-modules (nav, common states, shared labels).
 */
export const en = {
  plugins: {
    // ── Navigation / section titles ──────────────────────────────
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
  },
};
