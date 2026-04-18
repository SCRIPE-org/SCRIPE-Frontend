/**
 * FeaturesTab — Catalog-backed feature assignments for a plan.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Zap, CheckCircle2, XCircle } from "lucide-react";
import type { TenantPlan, TenantPlanFeatureData } from "../../domain/entities/TenantPlan";
import type { TFn } from "./shared-helpers";

interface FeaturesTabProps {
  plan: TenantPlan;
  t: TFn;
  language: string;
}

export function FeaturesTab({ plan, t, language }: FeaturesTabProps) {
  const features: TenantPlanFeatureData[] = plan.features || [];

  if (features.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Zap className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t("entitlements.tenantPlans.noFeatures")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("entitlements.tenantPlans.noFeaturesHint")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{t("entitlements.tenantPlans.tabFeatures") || "Features"}</CardTitle>
            <Badge variant="secondary" className="text-xs">{features.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {features.map((feature, idx) => (
            <div key={feature.featureDefinitionId || idx} className="flex items-center justify-between py-3 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {language === "ar"
                      ? (feature.featureDisplayNameAr || feature.featureDisplayNameEn || feature.featureKey)
                      : (feature.featureDisplayNameEn || feature.featureKey)}
                  </span>
                  <Badge variant="outline" className="text-[10px]">{feature.featureValueType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{feature.featureKey}</p>
              </div>
              <div className="shrink-0">
                {feature.featureValueType === "Boolean" ? (
                  feature.value === "true" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{feature.value}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
