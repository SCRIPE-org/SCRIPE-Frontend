"use client";

import { Globe2, ShieldCheck } from "lucide-react";
import { Badge } from "@core/ui/badge";

/**
 * Props for rendering the active tenant/platform scope banner on `/account/preferences`.
 */
export interface AccountScopeBannerProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  activeContextLabel: string;
  isSuperAdmin: boolean;
}

/**
 * Displays which scope (`/platform` vs active tenant) personal startup and workspace
 * start-page preferences apply to, along with Super Admin lock-immunity guidance.
 */
export function AccountScopeBanner({
  t,
  activeContextLabel,
  isSuperAdmin,
}: AccountScopeBannerProps) {
  return (
    <section
      aria-label={t("profile.preferences.scopeBannerLabel")}
      data-testid="account-preferences-scope-banner"
      className="flex flex-wrap items-center justify-between gap-2 rounded-nx-lg border border-nx-line bg-nx-surface px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <Globe2 className="h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
        <span className="text-xs font-medium text-nx-ink-2">
          {t("profile.preferences.scopeBannerLabel")}
        </span>
        <Badge
          variant="secondary"
          className="text-xs font-semibold"
          data-testid="account-scope-banner-context"
        >
          <bdi>{activeContextLabel}</bdi>
        </Badge>
      </div>

      {isSuperAdmin && (
        <Badge
          variant="info"
          className="text-[11px] font-medium"
          data-testid="scope-banner-superadmin-note"
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t("profile.preferences.scopeBannerSuperAdminNote")}</span>
        </Badge>
      )}
    </section>
  );
}
