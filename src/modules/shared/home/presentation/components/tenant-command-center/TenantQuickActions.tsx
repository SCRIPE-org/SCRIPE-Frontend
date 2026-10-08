"use client";

import React from "react";
import { Zap, UserPlus, Building2, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { TenantQuickActionItem } from "./tenantTypes";

interface TenantQuickActionsProps {
  actions: TenantQuickActionItem[];
}

export function TenantQuickActions({ actions }: TenantQuickActionsProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs border-border bg-card p-3.5 sm:p-4 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">
              {t("tenantCommandCenter.quickActions.title") || "Quick Actions"}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {t("tenantCommandCenter.quickActions.subtitle") || "Common workspace tasks."}
            </p>
          </div>
        </div>

        <Link href="/settings" className="text-xs font-semibold text-primary hover:underline shrink-0">
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
              className="shadow-xs group flex min-h-[92px] flex-col justify-between rounded-xl border border-border bg-card/60 p-3 transition-all hover:border-primary/40 hover:bg-muted/40"
            >
              <div
                className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${action.color}18`,
                  color: action.color,
                }}
              >
                {action.id === "qa-1" && <UserPlus className="h-4 w-4" />}
                {action.id === "qa-2" && <Building2 className="h-4 w-4" />}
                {action.id === "qa-3" && <ShieldCheck className="h-4 w-4" />}
                {action.id === "qa-4" && <Settings className="h-4 w-4" />}
              </div>

              <div>
                <b className="block text-xs font-bold text-foreground transition-colors group-hover:text-primary">
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
                <span className="block text-[10px] text-muted-foreground">
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
