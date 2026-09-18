"use client";

import React, { useState } from "react";
import { Zap, ChevronDown, ChevronRight, Users, Building2, Database, ShieldAlert } from "lucide-react";
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
      iconBg: "bg-slate-800/60 border-slate-700/60",
      iconColor: "text-slate-300",
    },
    {
      title: t("platformCommandCenter.workbench.manageTenants") || "Manage tenants",
      subtitle: "View and manage",
      href: "/tenants",
      icon: Building2,
      iconBg: "bg-slate-800/60 border-slate-700/60",
      iconColor: "text-slate-300",
    },
    {
      title: t("platformCommandCenter.workbench.resolveQuota") || "Resolve quota pressure",
      subtitle: "4 tenants near limit",
      href: "/entitlements",
      icon: Database,
      iconBg: "bg-[#84cc16]/10 border-[#84cc16]/20",
      iconColor: "text-[#84cc16]",
    },
    {
      title: t("platformCommandCenter.workbench.reviewSecurity") || "Review security events",
      subtitle: "3 critical events",
      href: "/security",
      icon: ShieldAlert,
      iconBg: "bg-rose-500/10 border-rose-500/20",
      iconColor: "text-rose-500",
    },
  ];

  return (
    <Card className="h-full flex flex-col justify-between bg-[#0c101a] border-border/60 shadow-xl overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#84cc16]/10 text-[#84cc16] flex items-center justify-center">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-white">
              {t("platformCommandCenter.workbench.title") || "Operational workbench"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              {t("platformCommandCenter.workbench.subtitle") || "Common administrative tasks"}
            </CardDescription>
          </div>
        </div>

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141a29] border border-slate-700/60 text-xs text-white hover:bg-slate-800/80 transition-colors"
          >
            <span>{t("platformCommandCenter.workbench.quickActions") || "Quick actions"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-[#141a29] border border-slate-700 shadow-xl py-1 z-30">
              <Link
                href="/tenants"
                onClick={() => setDropdownOpen(false)}
                className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                Provision Tenant
              </Link>
              <Link
                href="/roles"
                onClick={() => setDropdownOpen(false)}
                className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                Assign Permissions
              </Link>
              <Link
                href="/security"
                onClick={() => setDropdownOpen(false)}
                className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              >
                Block Threat IP
              </Link>
            </div>
          )}
        </div>
      </CardHeader>

      {/* 2x2 Grid */}
      <CardContent className="pt-4 pb-4 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0e131f] border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${action.iconBg} ${action.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white group-hover:text-[#84cc16] transition-colors block truncate">
                      {action.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {action.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

