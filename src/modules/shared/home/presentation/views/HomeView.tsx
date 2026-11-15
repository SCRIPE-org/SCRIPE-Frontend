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
      <div className="animate-pulse motion-reduce:animate-none space-y-6">
        <div className="h-20 rounded-xl border border-nx-line bg-nx-raised" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-28 rounded-xl border border-nx-line bg-nx-raised" />
          <div className="h-28 rounded-xl border border-nx-line bg-nx-raised" />
          <div className="h-28 rounded-xl border border-nx-line bg-nx-raised" />
          <div className="h-28 rounded-xl border border-nx-line bg-nx-raised" />
        </div>
        <div className="h-64 rounded-xl border border-nx-line bg-nx-raised" />
      </div>
    );
  }

  return isPlatform ? <PlatformOverviewView /> : <TenantOverviewView />;
}
