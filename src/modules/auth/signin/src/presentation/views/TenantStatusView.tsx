/**
 * TenantStatusView — Displays tenant suspension/cancellation/not-found status pages.
 *
 * Branded page showing the tenant logo and a clear message about why access is blocked.
 * Follows industry standards (Shopify, Vercel, Slack).
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { BRAND } from "@core/config/branding";
import { resolveFileUrl } from "@core/common/utils";
import { AlertTriangle, XCircle, SearchX } from "lucide-react";
import type { TenantBranding } from "@modules/auth/hooks/useTenantResolution";

// ─── Suspended / Canceled View ────────────────────────────

interface TenantSuspendedViewProps {
      branding: TenantBranding;
}

export function TenantSuspendedView({ branding }: TenantSuspendedViewProps) {
      const { t, direction } = useI18n();
      const isCanceled = branding.status === "canceled";
      const companyName = branding.companyName ?? branding.name ?? BRAND.name;
      const logoSrc = branding.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";

      return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={direction}>
                  <div className="mx-auto w-full max-w-md text-center">
                        {/* Tenant Logo */}
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                              <img
                                    src={logoSrc}
                                    alt={companyName}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
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
                                    ? (t("tenant.status.canceledTitle") || "Organization Canceled")
                                    : (t("tenant.status.suspendedTitle") || "Organization Suspended")
                              }
                        </h1>

                        {/* Description */}
                        <p className="mb-4 text-muted-foreground">
                              {isCanceled
                                    ? (t("tenant.status.canceledDescription") || `The organization "${companyName}" has been canceled. Contact support to reactivate your subscription.`)
                                    : (t("tenant.status.suspendedDescription") || `The organization "${companyName}" has been temporarily suspended. Please contact your administrator.`)
                              }
                        </p>

                        {/* Reason (if provided) */}
                        {branding.statusReason && (
                              <div className="mb-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                                    <span className="font-medium">{t("tenant.status.reason") || "Reason"}: </span>
                                    {branding.statusReason}
                              </div>
                        )}

                        {/* Contact Support Link */}
                        <a
                              href={`mailto:support@${BRAND.domain || "nexora.com"}`}
                              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                              {t("tenant.status.contactSupport") || "Contact Support"}
                        </a>
                  </div>
            </div>
      );
}

// ─── Not Found View ───────────────────────────────────────

export function TenantNotFoundView() {
      const { t, direction } = useI18n();

      return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={direction}>
                  <div className="mx-auto w-full max-w-md text-center">
                        {/* Platform Logo */}
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                              <img
                                    src="/app-logo.png"
                                    alt={BRAND.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                        </div>

                        {/* Icon */}
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                              <SearchX className="h-8 w-8 text-muted-foreground" />
                        </div>

                        {/* Title */}
                        <h1 className="mb-3 text-2xl font-bold text-foreground">
                              {t("tenant.status.notFoundTitle") || "Organization Not Found"}
                        </h1>

                        {/* Description */}
                        <p className="mb-8 text-muted-foreground">
                              {t("tenant.status.notFoundDescription") || "This organization doesn\u2019t exist on our platform. Please check the URL and try again."}
                        </p>

                        {/* Go to Platform */}
                        <a
                              href="/"
                              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                              {t("tenant.status.visitPlatform") || `Visit ${BRAND.name}`}
                        </a>
                  </div>
            </div>
      );
}
