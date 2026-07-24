"use client";

import { useRef, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useImpersonation } from "@modules/auth/core/src/presentation/viewmodels/useImpersonation";
import { UserCheck, Building2, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@core/common/utils";

/**
 * TenantContextBanner
 *
 * A full-width banner rendered above ALL layout templates in DashboardLayout.
 * Automatically offsets fixed headers/sidebars via the --tenant-banner-height
 * CSS variable set on <html>.
 *
 * Shows either:
 *  - An impersonation warning with a Stop button
 *  - A tenant drilldown indicator with an Exit button
 *  - Nothing when neither state is active
 *
 * Severity speaks through the glyph, the hairline and the wash — the copy stays
 * neutral ink. The banner used to tint its own text with the status hue, which
 * puts red type on a red wash and makes the one line the user must read the
 * least readable thing on the page.
 */

/** Relative (in-flow), NOT sticky, so the Nexus flex layout can calculate the
 *  remaining height without overlapping the banner. */
const BANNER_SHELL =
  "relative z-raised flex w-full shrink-0 items-center justify-center gap-3 border-b px-4 py-2 text-nx-ink";

/** 32px keeps the control on the hit-target floor inside a 2-unit-tall strip. */
const BANNER_ACTION = "h-8 text-xs";

export function TenantContextBanner() {
  const { t } = useI18n();
  const { currentTenant, exitTenantWorld } = useTenantContext();
  const { isImpersonating, stopImpersonation } = useImpersonation();
  const router = useRouter();
  const bannerRef = useRef<HTMLDivElement>(null);

  const activeTenantId = currentTenant?.id;
  const isActive = isImpersonating || !!(activeTenantId && currentTenant);

  // Sync the banner height → CSS variable on <html>
  // so fixed headers/sidebars offset themselves automatically (see globals.css).
  useEffect(() => {
    const root = document.documentElement;
    if (isActive && bannerRef.current) {
      const h = bannerRef.current.offsetHeight;
      root.style.setProperty("--tenant-banner-height", `${h}px`);
      root.setAttribute("data-tenant-banner", "true");
    } else {
      root.style.setProperty("--tenant-banner-height", "0px");
      root.removeAttribute("data-tenant-banner");
    }
    return () => {
      root.style.setProperty("--tenant-banner-height", "0px");
      root.removeAttribute("data-tenant-banner");
    };
  }, [isActive]);

  // ── Impersonation Banner ──
  if (isImpersonating) {
    return (
      <div
        ref={bannerRef}
        role="status"
        className={cn(BANNER_SHELL, "border-destructive/30 bg-destructive/10")}
      >
        <UserCheck className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
        <span className="text-sm font-medium">{t("chrome.tenantBanner.impersonating")}</span>
        <Button
          variant="destructive"
          size="sm"
          className={BANNER_ACTION}
          aria-label={t("chrome.tenantBanner.stopImpersonation")}
          onClick={stopImpersonation}
        >
          <X className="me-1 h-3 w-3" aria-hidden="true" />
          {t("common.stop")}
        </Button>
      </div>
    );
  }

  // ── Tenant Drilldown Banner ──
  if (activeTenantId && currentTenant) {
    return (
      <div ref={bannerRef} role="status" className={cn(BANNER_SHELL, "border-info/30 bg-info/10")}>
        <Building2 className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("chrome.tenantBanner.tenantContext")}
          </span>
          <span className="text-sm font-semibold">{currentTenant.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={BANNER_ACTION}
          aria-label={t("chrome.tenantBanner.exitTenantContext")}
          onClick={() => {
            exitTenantWorld();
            router.push("/tenants");
          }}
        >
          <X className="me-1 h-3 w-3" aria-hidden="true" />
          {t("common.exit")}
        </Button>
      </div>
    );
  }

  // ── No banner needed ──
  return null;
}
