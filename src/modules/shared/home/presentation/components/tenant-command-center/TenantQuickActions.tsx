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
    <Card className="p-4 border-border bg-card shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("tenantCommandCenter.quickActions.title") || "Quick Actions"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.quickActions.subtitle") || "Common workspace tasks."}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="text-xs font-semibold text-primary hover:underline"
        >
          {t("tenantCommandCenter.quickActions.customize") || "Customize"}
        </Link>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => {
          return (
            <Link
              key={action.id}
              href={action.href}
              className="p-3 rounded-xl border border-border bg-card/60 hover:bg-muted/40 hover:border-primary/40 transition-all group flex flex-col justify-between min-h-[92px] shadow-xs"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
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
                <b className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                  {action.id === "qa-1" ? t("tenantCommandCenter.quickActions.inviteAdmin") || action.title :
                   action.id === "qa-2" ? t("tenantCommandCenter.quickActions.createBranch") || action.title :
                   action.id === "qa-3" ? t("tenantCommandCenter.quickActions.manageRoles") || action.title :
                   action.id === "qa-4" ? t("tenantCommandCenter.quickActions.workspaceSettings") || action.title :
                   action.title}
                </b>
                <span className="text-[10px] text-muted-foreground block">
                  {action.id === "qa-1" ? t("tenantCommandCenter.quickActions.inviteAdminDesc") || action.description :
                   action.id === "qa-2" ? t("tenantCommandCenter.quickActions.createBranchDesc") || action.description :
                   action.id === "qa-3" ? t("tenantCommandCenter.quickActions.manageRolesDesc") || action.description :
                   action.id === "qa-4" ? t("tenantCommandCenter.quickActions.workspaceSettingsDesc") || action.description :
                   action.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
