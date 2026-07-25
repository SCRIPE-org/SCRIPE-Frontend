/**
 * GeneralTab — Plan settings, display names, billing toggles, limits.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Settings, Shield, Calendar, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import { formatUtc } from "@core/common/utils";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import { InfoRow, FlagRow, type TFn } from "./shared-helpers";

interface GeneralTabProps {
  plan: TenantPlan;
  t: TFn;
}

/**
 * Presentation UI component rendering the general tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function GeneralTab({ plan, t }: GeneralTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-nx-ink-2" aria-hidden="true" />
            {t("entitlements.tenantPlans.tabGeneral")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label={t("entitlements.tenantPlans.planName")} value={plan.name} />
          <InfoRow
            label={t("entitlements.tenantPlans.displayNameEn")}
            value={plan.displayNameEn || "—"}
          />
          <InfoRow
            label={t("entitlements.tenantPlans.displayNameAr")}
            value={plan.displayNameAr || "—"}
          />
          <InfoRow label={t("common.description")} value={plan.description || "—"} />
          <InfoRow label={t("entitlements.tenantPlans.tagline")} value={plan.tagline || "—"} />
          <InfoRow label={t("entitlements.tenantPlans.tier")} value={String(plan.tierLevel)} />
          <InfoRow
            label={t("entitlements.tenantPlans.sortOrder")}
            value={String(plan.sortOrder)}
          />
          <InfoRow
            label={t("common.createdAt")}
            value={plan.createdAt ? formatUtc(plan.createdAt, "PPp") : "—"}
          />
          {plan.updatedAt && (
            <InfoRow label={t("common.updatedAt")} value={formatUtc(plan.updatedAt, "PPp")} />
          )}
        </CardContent>
      </Card>

      {/* Settings & Flags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-nx-ink-2" aria-hidden="true" />
            {t("entitlements.tenantPlans.tabSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FlagRow
            icon={<Eye aria-hidden="true" />}
            label={t("entitlements.tenantPlans.isPublic")}
            value={plan.isPublic}
          />
          <FlagRow
            icon={<CheckCircle2 aria-hidden="true" />}
            label={t("common.active")}
            value={plan.isActive}
          />
          <FlagRow
            icon={<Sparkles aria-hidden="true" />}
            label={t("entitlements.tenantPlans.selfServiceEnabled")}
            value={plan.isSelfServiceEnabled}
          />
          <FlagRow
            icon={<EyeOff aria-hidden="true" />}
            label={t("entitlements.tenantPlans.contactSalesOnly")}
            value={plan.isContactSalesOnly}
          />
          <div className="mt-3 border-t border-nx-line pt-3" />
          <FlagRow
            icon={<Calendar aria-hidden="true" />}
            label={t("entitlements.tenantPlans.allowMonthly")}
            value={plan.allowMonthly}
          />
          <FlagRow
            icon={<Calendar aria-hidden="true" />}
            label={t("entitlements.tenantPlans.allowYearly")}
            value={plan.allowYearly}
          />
          <FlagRow
            icon={<Calendar aria-hidden="true" />}
            label={t("entitlements.tenantPlans.allowLifetime")}
            value={plan.allowLifetime}
          />
          <FlagRow
            icon={<Calendar aria-hidden="true" />}
            label={t("entitlements.tenantPlans.allowTrial")}
            value={plan.allowTrial}
          />
          <div className="mt-3 border-t border-nx-line pt-3" />
          <InfoRow
            label={t("entitlements.tenantPlans.trialDays")}
            value={String(plan.trialDays)}
          />
          <InfoRow
            label={t("entitlements.tenantPlans.gracePeriodDays")}
            value={String(plan.gracePeriodDays)}
          />
          <InfoRow label={t("entitlements.tenantPlans.maxUsers")} value={plan.maxUsersDisplay} />
          <InfoRow
            label={t("entitlements.tenantPlans.maxSubscribers")}
            value={
              plan.maxSubscribers != null
                ? String(plan.maxSubscribers)
                : t("entitlements.tenantPlans.unlimited")
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
