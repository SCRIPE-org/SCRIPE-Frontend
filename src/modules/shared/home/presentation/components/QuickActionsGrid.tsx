"use client";

/**
 * Quick Actions Grid
 *
 * Clickable navigation cards linking to major system sections.
 * Actions are filtered by user permissions — only shows cards
 * the user actually has access to.
 *
 * Uses SYSTEM_PERMISSIONS constants (matching backend) for consistency.
 */
import { useMemo, memo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS, type PermissionCode } from "@core/common/types/permissions";
import { Card, CardContent } from "@core/ui/card";
import {
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  BarChart3,
  Users,
  Building2,
  KeyRound,
  Settings,
} from "lucide-react";

interface QuickAction {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  color: string;
  bgColor: string;
  description: string;
  /** Permission required to see this action. Empty = always visible */
  permission?: PermissionCode;
}

const ALL_ACTIONS: QuickAction[] = [
  {
    href: "/dashboard",
    labelKey: "overview.actions.dashboard",
    icon: LayoutDashboard,
    color: "text-info",
    bgColor: "bg-info/10",
    description: "overview.actions.dashboardDesc",
    permission: SYSTEM_PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    href: "/audit",
    labelKey: "overview.actions.audit",
    icon: ScrollText,
    color: "text-success",
    bgColor: "bg-success/10",
    description: "overview.actions.auditDesc",
    permission: SYSTEM_PERMISSIONS.AUDIT_VIEW,
  },
  {
    href: "/security",
    labelKey: "overview.actions.security",
    icon: ShieldCheck,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    description: "overview.actions.securityDesc",
    permission: SYSTEM_PERMISSIONS.SECURITY_VIEW,
  },
  {
    href: "/analytics",
    labelKey: "overview.actions.analytics",
    icon: BarChart3,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "overview.actions.analyticsDesc",
    permission: SYSTEM_PERMISSIONS.ANALYTICS_VIEW,
  },
  {
    href: "/admins",
    labelKey: "overview.actions.admins",
    icon: Users,
    color: "text-warning",
    bgColor: "bg-warning/10",
    description: "overview.actions.adminsDesc",
    permission: SYSTEM_PERMISSIONS.ADMINS_VIEW,
  },
  {
    href: "/tenants",
    labelKey: "overview.actions.tenants",
    icon: Building2,
    color: "text-info",
    bgColor: "bg-info/10",
    description: "overview.actions.tenantsDesc",
    permission: SYSTEM_PERMISSIONS.TENANTS_VIEW,
  },
  {
    href: "/roles",
    labelKey: "overview.actions.roles",
    icon: KeyRound,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "overview.actions.rolesDesc",
    permission: SYSTEM_PERMISSIONS.ROLES_VIEW,
  },
  {
    href: "/settings",
    labelKey: "overview.actions.settings",
    icon: Settings,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    description: "overview.actions.settingsDesc",
    // No permission — always visible to authenticated users
  },
];

export const QuickActionsGrid = memo(function QuickActionsGrid() {
  const { t } = useI18n();
  const { hasPermission } = usePermissions();

  // Filter actions the user is allowed to see
  const visibleActions = useMemo(
    () => ALL_ACTIONS.filter((action) => !action.permission || hasPermission(action.permission)),
    [hasPermission]
  );

  if (visibleActions.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t("overview.quickActions")}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full transition-all duration-200 hover:border-primary/20 hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
                  <div
                    className={`rounded-xl p-3 ${action.bgColor} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t(action.labelKey)}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {t(action.description)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
});
