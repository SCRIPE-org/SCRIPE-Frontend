/**
 * Plugins — Catalog sub-module locale (English)
 */
export const en = {
  plugins: {
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
