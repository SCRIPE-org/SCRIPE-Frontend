/**
 * Identity Provider Empty State
 *
 * Premium empty state display for when no SSO providers are configured.
 * Encourages setup with template wizard link.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Fingerprint, Plus } from "lucide-react";

interface Props {
  onCreateClick: () => void;
}

/**
 * Presentation UI component rendering the identity provider empty state.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function IdentityProviderEmptyState({ onCreateClick }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/30 p-8 text-center backdrop-blur-sm">
      {/* Icon frame with purple outer glow */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 shadow-[0_0_25px_rgba(168,85,247,0.15)]">
        <Fingerprint className="h-8 w-8 text-primary" />
        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
          <Plus className="h-3 w-3" strokeWidth={3} />
        </div>
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-tight">
        {t("identityProviders.emptyTitle") || "No Identity Providers"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {t("identityProviders.emptyDesc") ||
          "Configure Single Sign-On (SSO) using OpenID Connect (OIDC), OAuth 2.0, or SAML 2.0 to let users log in with external credentials."}
      </p>

      {/* Primary button using Scripe Auth brand gradient */}
      <Button
        onClick={onCreateClick}
        className="mt-6 border-0 bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#4F46E5] px-5 py-2.5 font-medium text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:opacity-95 hover:shadow-xl active:scale-[0.98]"
      >
        <Plus className="me-1.5 h-4 w-4" strokeWidth={2.5} />
        {t("identityProviders.createButton") || "Add Identity Provider"}
      </Button>
    </div>
  );
}
