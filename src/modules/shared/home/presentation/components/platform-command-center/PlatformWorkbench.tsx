"use client";

import React, { useState } from "react";
import {
  Zap,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
  Database,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";

export function PlatformWorkbench() {
  const { t } = useI18n();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const actions = [
    {
      title: t("platformCommandCenter.workbench.reviewAccess") || "Review access requests",
      subtitle: "5 pending",
      href: "/roles",
      icon: Users,
      iconBg: "bg-nx-raised border-nx-line",
      iconColor: "text-nx-ink-2",
    },
    {
      title: t("platformCommandCenter.workbench.manageTenants") || "Manage tenants",
      subtitle: "View and manage",
      href: "/tenants",
      icon: Building2,
      iconBg: "bg-nx-raised border-nx-line",
      iconColor: "text-nx-ink-2",
    },
    {
      title: t("platformCommandCenter.workbench.resolveQuota") || "Resolve quota pressure",
      subtitle: "4 tenants near limit",
      href: "/entitlements",
      icon: Database,
      iconBg: "bg-warning/10 border-warning/30",
      iconColor: "text-warning",
    },
    {
      title: t("platformCommandCenter.workbench.reviewSecurity") || "Review security events",
      subtitle: "3 critical events",
      href: "/security",
      icon: ShieldAlert,
      iconBg: "bg-destructive/10 border-destructive/30",
      iconColor: "text-destructive",
    },
  ];

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-nx-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-nx-ink">
              {t("platformCommandCenter.workbench.title") || "Operational workbench"}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2">
              {t("platformCommandCenter.workbench.subtitle") || "Common administrative tasks"}
            </CardDescription>
          </div>
        </div>

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-nx-line bg-nx-raised px-3 py-1.5 text-xs text-nx-ink transition-colors hover:bg-nx-raised-2"
          >
            <span>{t("platformCommandCenter.workbench.quickActions") || "Quick actions"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-nx-ink-3" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-30 mt-1.5 w-40 rounded-lg border border-nx-line bg-nx-surface py-1 shadow-nx-popover">
              <Link
                href="/tenants"
                onClick={() => setDropdownOpen(false)}
                className="block px-3 py-1.5 text-xs text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
              >
                Provision Tenant
              </Link>
              <Link
                href="/roles"
                onClick={() => setDropdownOpen(false)}
                className="block px-3 py-1.5 text-xs text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
              >
                Assign Permissions
              </Link>
              <Link
                href="/security"
                onClick={() => setDropdownOpen(false)}
                className="block px-3 py-1.5 text-xs text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
              >
                Block Threat IP
              </Link>
            </div>
          )}
        </div>
      </CardHeader>

      {/* 2x2 Grid */}
      <CardContent className="flex flex-1 flex-col justify-between pb-4 pt-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center justify-between rounded-xl border border-nx-line bg-nx-raised/40 p-3 transition-all hover:border-nx-line-hi hover:bg-nx-raised"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${action.iconBg} ${action.iconColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-nx-ink transition-colors group-hover:text-primary">
                      {action.title}
                    </span>
                    <span className="block truncate text-[11px] text-nx-ink-3">
                      {action.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-nx-ink-3 transition-colors group-hover:text-nx-ink" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
