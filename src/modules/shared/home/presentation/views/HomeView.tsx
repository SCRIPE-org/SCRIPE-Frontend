"use client";

/**
 * HomeView (Overview Page Gateway)
 *
 * Resolves active administration context (Platform vs Tenant)
 * and renders the corresponding view:
 * - Platform Context: PlatformOverviewView (Platform Command Center)
 * - Tenant Context: TenantOverviewView (Tenant Organization Control Center)
 */
import { useAdminContext } from "@core/hooks/useAdminContext";
import { PlatformOverviewView } from "./PlatformOverviewView";
import { TenantOverviewView } from "./TenantOverviewView";

export function HomeView() {
  const { isPlatform, isHydrated } = useAdminContext();

  if (!isHydrated) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-20 rounded-xl bg-muted/40" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-28 rounded-xl bg-muted/40" />
          <div className="h-28 rounded-xl bg-muted/40" />
          <div className="h-28 rounded-xl bg-muted/40" />
          <div className="h-28 rounded-xl bg-muted/40" />
        </div>
        <div className="h-64 rounded-xl bg-muted/40" />
      </div>
    );
  }

  return isPlatform ? <PlatformOverviewView /> : <TenantOverviewView />;
}
