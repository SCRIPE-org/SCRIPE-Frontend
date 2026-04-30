"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import type { CreateTenantPlanRequest } from "../../../domain/entities/TenantPlanRequests";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { BooleanIndicator } from "@modules/entitlements/editions/src/presentation/components/comparison";

interface TenantPlanStepReviewProps {
  form: Partial<CreateTenantPlanRequest>;
  t: (key: string) => string;
}

export function TenantPlanStepReview({ form, t }: TenantPlanStepReviewProps) {
  const missingRequired = !form.name;

  return (
    <div className="space-y-6">
      {missingRequired && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium text-sm">
            {t("entitlements.tenantPlans.missingRequired") || "Missing required fields: Plan Name is required before saving."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t("entitlements.tenantPlans.basicDetails") || "Basic Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("entitlements.tenantPlans.planName") || "Plan Name"}</p>
              <p className="font-medium">{form.name || "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("entitlements.tenantPlans.displayNameEn") || "Display Name (EN)"}</p>
                <p className="font-medium">{form.displayNameEn || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("entitlements.tenantPlans.displayNameAr") || "Display Name (AR)"}</p>
                <p className="font-medium">{form.displayNameAr || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("entitlements.tenantPlans.tier") || "Tier Level"}</p>
              <p className="font-medium">{form.tierLevel}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("entitlements.tenantPlans.isPublic") || "Publicly Visible"}</p>
                <BooleanIndicator value={form.isPublic ?? true} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("entitlements.tenantPlans.isContactSalesOnly") || "Contact Sales Only"}</p>
                <BooleanIndicator value={form.isContactSalesOnly ?? false} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t("entitlements.tenantPlans.billingAndAccess") || "Billing & Access"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t("entitlements.tenantPlans.supportedCycles") || "Supported Cycles"}</p>
              <div className="flex gap-2">
                {form.allowMonthly && <Badge variant="secondary">Monthly</Badge>}
                {form.allowYearly && <Badge variant="secondary">Yearly</Badge>}
                {form.allowLifetime && <Badge variant="secondary">Lifetime</Badge>}
                {!form.allowMonthly && !form.allowYearly && !form.allowLifetime && (
                  <span className="text-sm text-muted-foreground">None selected</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("entitlements.tenantPlans.maxUsers") || "Max Users"}</p>
                <p className="font-medium">{form.maxUsers === -1 ? "Unlimited (∞)" : form.maxUsers}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("entitlements.tenantPlans.allowTrial") || "Trial"}</p>
                <p className="font-medium">{form.allowTrial ? `${form.trialDays} Days` : "No Trial"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("entitlements.tenantPlans.isSelfServiceEnabled") || "Self-Service Checkout"}</p>
              <BooleanIndicator value={form.isSelfServiceEnabled ?? true} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg border text-sm text-muted-foreground">
        <p><strong>Note:</strong> Pricing values and detailed feature toggles are configured on the <strong>Pricing</strong> and <strong>Features</strong> tabs after the plan is initially created.</p>
      </div>
    </div>
  );
}
