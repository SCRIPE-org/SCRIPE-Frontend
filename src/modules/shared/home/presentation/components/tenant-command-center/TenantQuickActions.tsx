"use client";

import React from "react";
import { Zap, UserPlus, Building2, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import type { TenantQuickActionItem } from "./tenantTypes";

interface TenantQuickActionsProps {
  actions: TenantQuickActionItem[];
}

export function TenantQuickActions({ actions }: TenantQuickActionsProps) {
  const { t } = useI18n();

  return (
    <Card className="p-4 sm:p-5 min-w-0 overflow-hidden border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi">
      {/* Header */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--warning) 12%, transparent)",
              color: "var(--warning)",
            }}
          >
            <Zap className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-nx-ink truncate">
              {t("tenantCommandCenter.quickActions.title") || "Quick Actions"}
            </h3>
            <p className="text-xs text-nx-ink-3 truncate">
              {t("tenantCommandCenter.quickActions.subtitle") || "Common workspace tasks."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="text-xs font-semibold text-nx-accent hover:underline shrink-0"
        >
          {t("tenantCommandCenter.quickActions.customize") || "Customize"}
        </Link>
      </div>

      {/* Container Grid */}
      <div className="quickactions-container-grid">
        {actions.map((action) => {
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex min-h-[96px] flex-col justify-between rounded-nx-md border border-nx-line bg-transparent p-3.5 transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter hover:border-nx-line-hi hover:bg-nx-raised"
            >
              <div
                className="mb-2 flex h-8 w-8 items-center justify-center rounded-nx-md transition-transform duration-nx-micro group-hover:scale-105"
                style={{
                  background: `color-mix(in oklch, ${action.color} 12%, transparent)`,
                  color: action.color,
                }}
              >
                {action.id === "qa-1" && <UserPlus className="h-4 w-4" />}
                {action.id === "qa-2" && <Building2 className="h-4 w-4" />}
                {action.id === "qa-3" && <ShieldCheck className="h-4 w-4" />}
                {action.id === "qa-4" && <Settings className="h-4 w-4" />}
              </div>

              <div>
                <b className="block text-xs font-semibold text-nx-ink transition-colors group-hover:text-nx-accent">
                  {action.id === "qa-1"
                    ? t("tenantCommandCenter.quickActions.inviteAdmin") || action.title
                    : action.id === "qa-2"
                      ? t("tenantCommandCenter.quickActions.createBranch") || action.title
                      : action.id === "qa-3"
                        ? t("tenantCommandCenter.quickActions.manageRoles") || action.title
                        : action.id === "qa-4"
                          ? t("tenantCommandCenter.quickActions.workspaceSettings") || action.title
                          : action.title}
                </b>
                <span className="block text-[11px] text-nx-ink-3">
                  {action.id === "qa-1"
                    ? t("tenantCommandCenter.quickActions.inviteAdminDesc") || action.description
                    : action.id === "qa-2"
                      ? t("tenantCommandCenter.quickActions.createBranchDesc") || action.description
                      : action.id === "qa-3"
                        ? t("tenantCommandCenter.quickActions.manageRolesDesc") ||
                          action.description
                        : action.id === "qa-4"
                          ? t("tenantCommandCenter.quickActions.workspaceSettingsDesc") ||
                            action.description
                          : action.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
