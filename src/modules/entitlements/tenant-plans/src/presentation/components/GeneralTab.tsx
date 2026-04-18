/**
 * GeneralTab — Plan settings, display names, billing toggles, limits.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  Settings, Shield, Calendar, Eye, EyeOff, Sparkles,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import { InfoRow, FlagRow, type TFn } from "./shared-helpers";

interface GeneralTabProps {
  plan: TenantPlan;
  t: TFn;
}

export function GeneralTab({ plan, t }: GeneralTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            {t("common.general") || "General Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label={t("entitlements.tenantPlans.planName") || "Name"} value={plan.name} />
          <InfoRow label={t("entitlements.tenantPlans.displayNameEn") || "Display (EN)"} value={plan.displayNameEn || "—"} />
          <InfoRow label={t("entitlements.tenantPlans.displayNameAr") || "Display (AR)"} value={plan.displayNameAr || "—"} />
          <InfoRow label={t("common.description") || "Description"} value={plan.description || "—"} />
          <InfoRow label={t("entitlements.tenantPlans.tagline") || "Tagline"} value={plan.tagline || "—"} />
          <InfoRow label={t("entitlements.tenantPlans.tier") || "Tier"} value={String(plan.tierLevel)} />
          <InfoRow label={t("entitlements.tenantPlans.sortOrder") || "Sort Order"} value={String(plan.sortOrder)} />
          <InfoRow label={t("common.createdAt") || "Created"} value={plan.createdAt ? format(new Date(plan.createdAt), "PPp") : "—"} />
          {plan.updatedAt && (
            <InfoRow label={t("common.updatedAt") || "Updated"} value={format(new Date(plan.updatedAt), "PPp")} />
          )}
        </CardContent>
      </Card>

      {/* Settings & Flags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            {t("common.settings") || "Settings"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FlagRow icon={<Eye />} label={t("entitlements.tenantPlans.isPublic") || "Publicly Visible"} value={plan.isPublic} />
          <FlagRow icon={<CheckCircle2 />} label={t("common.active") || "Active"} value={plan.isActive} />
          <FlagRow icon={<Sparkles />} label={t("entitlements.tenantPlans.selfServiceEnabled") || "Self-Service Enabled"} value={plan.isSelfServiceEnabled} />
          <FlagRow icon={<EyeOff />} label={t("entitlements.tenantPlans.contactSalesOnly") || "Contact Sales Only"} value={plan.isContactSalesOnly} />
          <div className="border-t pt-3 mt-3" />
          <FlagRow icon={<Calendar />} label={t("entitlements.tenantPlans.allowMonthly") || "Monthly"} value={plan.allowMonthly} />
          <FlagRow icon={<Calendar />} label={t("entitlements.tenantPlans.allowYearly") || "Yearly"} value={plan.allowYearly} />
          <FlagRow icon={<Calendar />} label={t("entitlements.tenantPlans.allowLifetime") || "Lifetime"} value={plan.allowLifetime} />
          <FlagRow icon={<Calendar />} label={t("entitlements.tenantPlans.allowTrial") || "Trial"} value={plan.allowTrial} />
          <div className="border-t pt-3 mt-3" />
          <InfoRow label={t("entitlements.tenantPlans.trialDays") || "Trial Days"} value={String(plan.trialDays)} />
          <InfoRow label={t("entitlements.tenantPlans.gracePeriodDays") || "Grace Period Days"} value={String(plan.gracePeriodDays)} />
          <InfoRow label={t("entitlements.tenantPlans.maxUsers") || "Max Users"} value={plan.maxUsersDisplay} />
          <InfoRow label={t("entitlements.tenantPlans.maxSubscribers") || "Max Subscribers"} value={plan.maxSubscribers != null ? String(plan.maxSubscribers) : t("entitlements.tenantPlans.unlimited") || "∞"} />
        </CardContent>
      </Card>
    </div>
  );
}
