"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { usePermissions } from "@core/providers/permission-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { USE_DYNAMIC_NAVIGATION } from "@core/config/navigation";
import { normalizeRoutePath } from "@core/config/app-route-manifest";
import type { MenuItem } from "@core/navigation/domain/entities/MenuItem";

const HRMS_CANDIDATE_ROUTES = [
  "/hrms/staff-members",
  "/hrms/employment-records",
  "/hrms/staff-assignments",
  "/hrms/staff-competencies",
  "/hrms/qualifications",
  "/hrms/certifications",
  "/hrms/staff-availabilities",
  "/work-items",
] as const;

function findFirstAccessibleLeaf(
  items: readonly MenuItem[],
  isAccessible: (route: string) => boolean
): string | null {
  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const item of sorted) {
    if (
      item.href &&
      !item.href.startsWith("#") &&
      normalizeRoutePath(item.href) !== "/hrms" &&
      isAccessible(item.href)
    ) {
      return item.href;
    }
    if (item.children && item.children.length > 0) {
      const nested = findFirstAccessibleLeaf(item.children, isAccessible);
      if (nested) return nested;
    }
  }
  return null;
}

export default function HrmsPage() {
  const router = useRouter();
  const { canAccessPage } = usePermissions();
  const routesLoaded = useNavigationStore((s) => s.routesLoaded);
  const routesError = useNavigationStore((s) => s.routesError);
  const workspaceGroups = useNavigationStore((s) => s.workspaceGroups);
  const workspaces = useNavigationStore((s) => s.workspaces);
  const workspaceRouteMap = useNavigationStore((s) => s.workspaceRouteMap);
  const hasRouteAccess = useNavigationStore((s) => s.hasRouteAccess);

  useEffect(() => {
    if (USE_DYNAMIC_NAVIGATION && !routesLoaded && !routesError) {
      return;
    }

    const isAccessible = (candidate: string): boolean => {
      const norm = normalizeRoutePath(candidate);
      if (!norm || norm === "/hrms") return false;
      if (!canAccessPage(norm)) return false;
      if (USE_DYNAMIC_NAVIGATION && routesLoaded && !hasRouteAccess(norm)) {
        return false;
      }
      return true;
    };

    const hrmsGroup =
      workspaceGroups.find((g) => g.workspaceKey.toLowerCase() === "hrms") ?? null;

    let target: string | null = null;
    if (hrmsGroup?.effectiveHomeRoute && isAccessible(hrmsGroup.effectiveHomeRoute)) {
      target = normalizeRoutePath(hrmsGroup.effectiveHomeRoute);
    }

    if (!target) {
      const hrmsTree =
        workspaces.get("hrms")?.menuItems ??
        hrmsGroup?.menuItems ??
        [];
      target = findFirstAccessibleLeaf(hrmsTree, isAccessible);
    }

    if (!target && workspaceRouteMap) {
      const hrmsRoutesEntry = Object.entries(workspaceRouteMap).find(
        ([key]) => key.toLowerCase() === "hrms"
      );
      target = hrmsRoutesEntry?.[1]?.find(isAccessible) ?? null;
    }

    if (!target) {
      target = HRMS_CANDIDATE_ROUTES.find(isAccessible) ?? null;
    }

    router.replace(target ?? "/not-authorized");
  }, [
    canAccessPage,
    hasRouteAccess,
    router,
    routesError,
    routesLoaded,
    workspaceGroups,
    workspaceRouteMap,
    workspaces,
  ]);

  return (
    <div className="flex min-h-[240px] items-center justify-center bg-nx-ground">
      <LoadingSpinner />
    </div>
  );
}
