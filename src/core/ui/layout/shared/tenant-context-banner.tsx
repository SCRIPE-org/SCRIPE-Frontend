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
 *  - An impersonation warning (red) with a Stop button
 *  - A tenant drilldown indicator (blue) with an Exit button
 *  - Nothing when neither state is active
 */
export function TenantContextBanner() {
  const { t, direction } = useI18n();
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
        className={cn(
          "relative z-[60] flex w-full items-center justify-center gap-3 border-b px-4 py-2",
          "border-red-300 bg-red-100 text-red-800",
          "dark:border-red-800 dark:bg-red-950/60 dark:text-red-200"
        )}
      >
        <UserCheck className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">
          {t("admin.impersonating") || "Impersonating User"}
        </span>
        <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={stopImpersonation}>
          <X className={cn("h-3 w-3", direction === "rtl" ? "ml-1" : "mr-1")} />
          {t("common.stop") || "Stop"}
        </Button>
      </div>
    );
  }

  // ── Tenant Drilldown Banner ──
  if (activeTenantId && currentTenant) {
    return (
      <div
        ref={bannerRef}
        className={cn(
          "relative z-[60] flex w-full items-center justify-center gap-3 border-b px-4 py-2",
          "border-blue-300 bg-blue-100 text-blue-800",
          "dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
        )}
      >
        <Building2 className="h-4 w-4 flex-shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase opacity-70">
            {t("tenant.context") || "Tenant Context"}
          </span>
          <span className="text-sm font-bold">{currentTenant.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-blue-300 text-xs hover:bg-blue-200 dark:border-blue-700 dark:hover:bg-blue-800"
          onClick={() => {
            exitTenantWorld();
            router.push("/tenants");
          }}
        >
          <X className={cn("h-3 w-3", direction === "rtl" ? "ml-1" : "mr-1")} />
          {t("common.exit") || "Exit"}
        </Button>
      </div>
    );
  }

  // ── No banner needed ──
  return null;
}
