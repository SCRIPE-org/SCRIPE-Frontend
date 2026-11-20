"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import type { SovereignEntitlementFeatureItem } from "../../../domain/entities/SovereignAccountEntities";

/**
 * Props for PlanFeaturesMatrixSection.
 */
export interface PlanFeaturesMatrixSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  features: SovereignEntitlementFeatureItem[];
  isSubmittingRequest: boolean;
  onRequestUpgrade: (featureCode: string, requestType: string) => void;
}

/**
 * Three-state feature entitlement matrix allowing role or edition upgrade requests.
 */
export function PlanFeaturesMatrixSection({
  t,
  features,
  isSubmittingRequest,
  onRequestUpgrade,
}: PlanFeaturesMatrixSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
          <CardTitle className="text-sm font-bold text-nx-ink">
            {t("profile.plan.featuresMatrixTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.plan.featuresMatrixDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {features.length === 0 ? (
          <p className="text-xs text-nx-ink-3">{t("profile.plan.noFeatures")}</p>
        ) : (
          features.map((feat) => (
            <div
              key={feat.featureCode}
              className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-nx-ink">{feat.featureName}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
                    {feat.category}
                  </Badge>
                </div>
                <p className="text-[11px] text-nx-ink-3 font-mono truncate">{feat.featureCode}</p>
              </div>

              {feat.state === "allowed" ? (
                <Badge
                  variant="outline"
                  className="border-success/30 text-success bg-success/10 text-[10px] gap-1 shrink-0"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t("profile.plan.stateAllowed")}</span>
                </Badge>
              ) : feat.state === "club_owned_request_role" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmittingRequest}
                  onClick={() => onRequestUpgrade(feat.featureCode, "REQUEST_ROLE")}
                  className="h-7 text-[11px] border-warning/40 text-warning hover:bg-warning/10 shrink-0"
                >
                  {t("profile.plan.requestRoleBtn")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmittingRequest}
                  onClick={() => onRequestUpgrade(feat.featureCode, "UPGRADE_EDITION")}
                  className="h-7 text-[11px] gap-1 shrink-0"
                >
                  <Lock className="h-3 w-3 text-nx-accent" />
                  <span>{t("profile.plan.requestUpgradeBtn")}</span>
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
