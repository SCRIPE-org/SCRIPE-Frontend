/**
 * TenantStatusView — Displays tenant suspension/cancellation/not-found status pages.
 *
 * Branded page showing the tenant logo and a clear message about why access is blocked.
 * Follows industry standards (Shopify, Vercel, Slack).
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { BRAND } from "@core/config/branding";
import { resolveFileUrl } from "@core/common/utils";
import { AlertTriangle, XCircle, SearchX } from "lucide-react";
import Link from "next/link";
import type { TenantBranding } from "@modules/auth/core/domain/entities/TenantBranding";

// ─── Suspended / Canceled View ────────────────────────────

interface TenantSuspendedViewProps {
  branding: TenantBranding;
}

/**
 * Presentation UI component rendering the tenant suspended view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantSuspendedView({ branding }: TenantSuspendedViewProps) {
  useModuleLocales(() => import("../../../locales"), "signin");
  const { t, direction } = useI18n();
  const isCanceled = branding.status === "canceled";
  const companyName = branding.companyName ?? branding.name ?? BRAND.name;
  const logoSrc = branding.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4"
      dir={direction}
    >
      <div className="mx-auto w-full max-w-md text-center">
        {/* Tenant Logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <img
            src={logoSrc}
            alt={companyName}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Status Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          {isCanceled ? (
            <XCircle className="h-8 w-8 text-destructive" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-foreground">
          {isCanceled
            ? t("tenantStatus.canceledTitle") || "Organization Canceled"
            : t("tenantStatus.suspendedTitle") || "Organization Suspended"}
        </h1>

        {/* Description */}
        <p className="mb-4 text-muted-foreground">
          {isCanceled
            ? t("tenantStatus.canceledDescription") ||
              `The organization "${companyName}" has been canceled. Contact support to reactivate your subscription.`
            : t("tenantStatus.suspendedDescription") ||
              `The organization "${companyName}" has been temporarily suspended. Please contact your administrator.`}
        </p>

        {/* Reason (if provided) */}
        {branding.statusReason && (
          <div className="mb-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium">{t("tenantStatus.reason") || "Reason"}: </span>
            {branding.statusReason}
          </div>
        )}

        {/* Contact Support Link */}
        <a
          href={`mailto:support@${BRAND.domain || "scripe.org"}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {t("tenantStatus.contactSupport") || "Contact Support"}
        </a>
      </div>
    </div>
  );
}

// ─── Not Found View ───────────────────────────────────────

/**
 * Presentation UI component rendering the tenant not found view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantNotFoundView() {
  useModuleLocales(() => import("../../../locales"), "signin");
  const { t, direction } = useI18n();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4"
      dir={direction}
    >
      <div className="mx-auto w-full max-w-md text-center">
        {/* Platform Logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <img
            src="/app-logo.png"
            alt={BRAND.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-foreground">
          {t("tenantStatus.notFoundTitle") || "Organization Not Found"}
        </h1>

        {/* Description */}
        <p className="mb-8 text-muted-foreground">
          {t("tenantStatus.notFoundDescription") ||
            "This organization doesn\u2019t exist on our platform. Please check the URL and try again."}
        </p>

        {/* Go to Platform */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {t("tenantStatus.visitPlatform") || `Visit ${BRAND.name}`}
        </Link>
      </div>
    </div>
  );
}
