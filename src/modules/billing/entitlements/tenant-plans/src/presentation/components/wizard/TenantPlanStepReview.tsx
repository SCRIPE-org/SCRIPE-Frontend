"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import type { CreateTenantPlanRequest } from "../../../domain/entities/TenantPlanRequests";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { BooleanIndicator } from "@modules/entitlements/core";

interface TenantPlanStepReviewProps {
  form: Partial<CreateTenantPlanRequest>;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the tenant plan step review.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanStepReview({ form, t }: TenantPlanStepReviewProps) {
  const missingRequired = !form.name;

  return (
    <div className="space-y-6">
      {missingRequired && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription className="font-medium">
            {t("entitlements.tenantPlans.missingRequired")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-nx-ink-3">
              <CheckCircle2 className="h-4 w-4 text-nx-accent" aria-hidden="true" />
              {t("entitlements.tenantPlans.basicDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-nx-ink-3">
                {t("entitlements.tenantPlans.planName")}
              </p>
              <p className="font-medium text-nx-ink">{form.name || "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-nx-ink-3">
                  {t("entitlements.tenantPlans.displayNameEn")}
                </p>
                <p className="font-medium text-nx-ink">{form.displayNameEn || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-nx-ink-3">
                  {t("entitlements.tenantPlans.displayNameAr")}
                </p>
                <p className="font-medium text-nx-ink">{form.displayNameAr || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-nx-ink-3">
                {t("entitlements.tenantPlans.tier")}
              </p>
              <p className="font-medium text-nx-ink tabular-nums">{form.tierLevel}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="mb-1 text-xs text-nx-ink-3">
                  {t("entitlements.tenantPlans.isPublic")}
                </p>
                <BooleanIndicator value={form.isPublic ?? true} />
              </div>
              <div>
                <p className="mb-1 text-xs text-nx-ink-3">
                  {t("entitlements.tenantPlans.isContactSalesOnly")}
                </p>
                <BooleanIndicator value={form.isContactSalesOnly ?? false} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-nx-ink-3">
              <CheckCircle2 className="h-4 w-4 text-nx-accent" aria-hidden="true" />
              {t("entitlements.tenantPlans.billingAndAccess")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1.5 text-xs text-nx-ink-3">
                {t("entitlements.tenantPlans.supportedCycles")}
              </p>
              <div className="flex gap-2">
                {form.allowMonthly && (
                  <Badge variant="secondary">
                    {t("entitlements.tenantPlans.monthly")}
                  </Badge>
                )}
                {form.allowYearly && (
                  <Badge variant="secondary">
                    {t("entitlements.tenantPlans.yearly")}
                  </Badge>
                )}
                {form.allowLifetime && (
                  <Badge variant="secondary">
                    {t("entitlements.tenantPlans.lifetime")}
                  </Badge>
                )}
                {!form.allowMonthly && !form.allowYearly && !form.allowLifetime && (
                  <span className="text-sm text-nx-ink-3">
                    {t("common.noneSelected")}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs text-nx-ink-3">
                  {t("entitlements.tenantPlans.maxUsers")}
                </p>
                <p className="font-medium text-nx-ink tabular-nums">
                  {form.maxUsers === -1
                    ? t("entitlements.tenantPlans.unlimited")
                    : form.maxUsers}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-nx-ink-3">
                  {t("entitlements.tenantPlans.allowTrial")}
                </p>
                <p className="font-medium text-nx-ink">
                  {form.allowTrial
                    ? `${form.trialDays} ${t("entitlements.tenantPlans.trialDays")}`
                    : t("common.noTrial")}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-nx-ink-3">
                {t("entitlements.tenantPlans.isSelfServiceEnabled")}
              </p>
              <BooleanIndicator value={form.isSelfServiceEnabled ?? true} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert variant="info">
        <Info aria-hidden="true" />
        <AlertDescription>
          <strong className="font-semibold text-nx-ink">{t("common.note")}:</strong>{" "}
          {t("entitlements.tenantPlans.reviewNote")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
