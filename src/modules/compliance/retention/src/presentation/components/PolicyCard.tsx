"use client";

import React from "react";
import { ShieldAlert, CheckCircle2, Clock, Archive, Pencil } from "lucide-react";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { usePermission } from "@core/hooks/use-permission";
import { formatDateUtc } from "@core/common/utils";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";

const CATEGORY_META: Record<string, { labelKey: string; icon: React.ReactNode; cls: string }> = {
  PersonalData: {
    labelKey: "compliance.categories.personalData",
    icon: <ShieldAlert className="h-4 w-4" />,
    cls: "border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 text-blue-600 dark:text-blue-400",
  },
  FinancialData: {
    labelKey: "compliance.categories.financialData",
    icon: <Archive className="h-4 w-4" />,
    cls: "border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 text-violet-600 dark:text-violet-400",
  },
  AuditLogs: {
    labelKey: "compliance.categories.auditLogs",
    icon: <Clock className="h-4 w-4" />,
    cls: "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 text-amber-600 dark:text-amber-400",
  },
  MarketingData: {
    labelKey: "compliance.categories.marketingData",
    icon: <CheckCircle2 className="h-4 w-4" />,
    cls: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/5 text-emerald-600 dark:text-emerald-400",
  },
};

/**
 * Interface defining property specifications, keys types, and structural contract rules for policy card props.
 */
export interface PolicyCardProps {
  policy: RetentionPolicy;
  onEdit: (policy: RetentionPolicy) => void;
}

/**
 * Presentation UI component rendering the policy card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PolicyCard({ policy, onEdit }: PolicyCardProps) {
  const { t } = useI18n();
  const meta = CATEGORY_META[policy.category] ?? CATEGORY_META.PersonalData;
  const { tenantCode } = useAppStore();
  const hasPermission = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_RETENTION_MANAGE);
  const canUpdate = hasPermission && !!tenantCode;

  return (
    <Card
      className={`border transition-all hover:shadow-md ${!policy.isActive ? "opacity-60" : ""} ${meta.cls.split(" ").slice(0, 2).join(" ")}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.cls}`}
            >
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{t(meta.labelKey)}</p>
                <Badge
                  variant={policy.isActive ? "default" : "secondary"}
                  className="h-5 px-1.5 text-[10px]"
                >
                  {policy.isActive ? t("compliance.active") : t("compliance.inactive")}
                </Badge>
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{policy.category}</p>
            </div>
          </div>
          {canUpdate && (
            <div className="flex shrink-0 gap-2">
              <Button
                id={`retention-edit-${policy.id}`}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onEdit(policy)}
              >
                <Pencil className="me-1.5 h-3 w-3" />
                {t("compliance.updatePolicy")}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-border/30 bg-background/60 p-3">
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{policy.retentionDays}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("compliance.retentionDays")}
            </p>
          </div>
          <div className="border-x border-border/30 text-center">
            <p className="text-lg font-bold tabular-nums">{policy.retentionYears}y</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("compliance.retentionCategory")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">
              {policy.expiryAction === "Delete"
                ? t("compliance.delete")
                : t("compliance.anonymize")}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("compliance.expiryAction")}
            </p>
          </div>
        </div>

        {policy.nextEvaluationAt && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("compliance.nextEvaluation")}:{" "}
              <span className="ms-1 font-medium text-foreground">
                {policy.nextEvaluationAt ? formatDateUtc(policy.nextEvaluationAt) : "—"}
              </span>
            </span>
            {policy.lastExecutionAt && (
              <span>
                {t("compliance.executionHistory")}:{" "}
                <span className="font-medium text-foreground">
                  {policy.lastExecutionAt ? formatDateUtc(policy.lastExecutionAt) : "—"}
                </span>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
