"use client";

import { ShieldAlert, CheckCircle2, Clock, Archive, Pencil, type LucideIcon } from "lucide-react";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { DetailRow } from "@core/ui/detail-row";
import { usePermission } from "@core/hooks/use-permission";
import { formatDateUtc } from "@core/common/utils";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";

// Category identity is carried by the icon tile only. The card itself stays a
// neutral surface: four differently-tinted card slabs in one grid read as four
// severities, which is not what a data category is.
const CATEGORY_META: Record<string, { labelKey: string; icon: LucideIcon; tile: string }> = {
  PersonalData: {
    labelKey: "compliance.categories.personalData",
    icon: ShieldAlert,
    tile: "border-info/30 bg-info/10 text-info",
  },
  FinancialData: {
    labelKey: "compliance.categories.financialData",
    icon: Archive,
    // --nx-accent is a complete colour, so its hairline tint is a color-mix
    // rather than slash-alpha, exactly as badge.tsx does it.
    tile: "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
  },
  AuditLogs: {
    labelKey: "compliance.categories.auditLogs",
    icon: Clock,
    tile: "border-warning/30 bg-warning/10 text-warning",
  },
  MarketingData: {
    labelKey: "compliance.categories.marketingData",
    icon: CheckCircle2,
    tile: "border-success/30 bg-success/10 text-success",
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
  const CategoryIcon = meta.icon;
  const { tenantCode } = useAppStore();
  const hasPermission = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_RETENTION_MANAGE);
  const canUpdate = hasPermission && !!tenantCode;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border ${meta.tile}`}
              aria-hidden="true"
            >
              <CategoryIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-nx-ink">{t(meta.labelKey)}</p>
                <Badge variant={policy.isActive ? "active" : "inactive"}>
                  {policy.isActive ? t("compliance.active") : t("compliance.inactive")}
                </Badge>
              </div>
              <p className="mt-0.5 truncate font-mono text-xs text-nx-ink-3">{policy.category}</p>
            </div>
          </div>
          {canUpdate && (
            <Button
              id={`retention-edit-${policy.id}`}
              variant="outline"
              size="sm"
              onClick={() => onEdit(policy)}
            >
              <Pencil className="me-1.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t("compliance.updatePolicy")}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <DetailRow
            layout="stacked"
            label={t("compliance.retentionDays")}
            value={policy.retentionDays.toLocaleString()}
          />
          <DetailRow
            layout="stacked"
            label={t("compliance.retentionYears")}
            value={policy.retentionYears}
          />
          <DetailRow
            layout="stacked"
            label={t("compliance.expiryAction")}
            value={
              policy.expiryAction === "Delete" ? t("compliance.delete") : t("compliance.anonymize")
            }
          />
        </div>

        {policy.nextEvaluationAt && (
          <div className="space-y-1.5">
            <DetailRow
              icon={Clock}
              label={t("compliance.nextEvaluation")}
              value={formatDateUtc(policy.nextEvaluationAt)}
            />
            {policy.lastExecutionAt && (
              <DetailRow
                label={t("compliance.lastExecution")}
                value={formatDateUtc(policy.lastExecutionAt)}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
