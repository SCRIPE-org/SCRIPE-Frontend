"use client";

/**
 * AccountPlanView
 *
 * Sovereign Slice 13 (/account/plan):
 * Active Edition & Contract Expiry Countdown Banner, 3-State Allowed Features & Entitlements Matrix,
 * Live Quota & Resource Consumption Gauges (with -1 Unlimited ∞ badges),
 * Assigned Seat License, Support SLA Tier, and Rotating 6-Digit Support Verification PIN.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useAccountPlanSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  Crown,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Gauge,
  KeyRound,
  Calendar,
} from "lucide-react";

export function AccountPlanView() {
  const { t } = useI18n();
  const { plan, submitPlanRequest, isSubmittingRequest } = useAccountPlanSliceViewModel();
  const [requestNotice, setRequestNotice] = useState(false);

  const features = plan?.features ?? [];
  const quotas = plan?.quotas ?? [];

  const handleRequestUpgrade = async (featureCode: string, requestType: string) => {
    await submitPlanRequest({
      type: requestType,
      code: featureCode,
    });
    setRequestNotice(true);
    setTimeout(() => setRequestNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.plan.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.plan.description")}
          </p>
        </div>

        {requestNotice && (
          <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t("profile.plan.requestSubmittedNotice")}</span>
          </Badge>
        )}
      </div>

      {/* 1. Active Edition & Contract Countdown Banner */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Crown className="h-4 w-4 text-nx-accent" />
              <span className="text-sm font-bold text-nx-ink">
                {plan?.editionName || ""}
              </span>
              {plan?.subscriptionStatus && (
                <Badge className="bg-nx-accent-fill text-nx-on-fill text-[10px] font-bold">
                  {plan.subscriptionStatus}
                </Badge>
              )}
              {plan?.editionCode && (
                <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
                  {plan.editionCode}
                </Badge>
              )}
            </div>
            <p className="text-xs text-nx-ink-2">
              {plan?.assignedSeatRole || ""} &bull; {plan?.supportSlaTier || ""}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2.5 rounded-xl border border-nx-line bg-nx-raised flex items-center gap-2">
              <Calendar className="h-4 w-4 text-nx-accent" />
              <div>
                <span className="text-[10px] text-nx-ink-3 block">
                  {t("profile.plan.contractRemaining")}
                </span>
                <span className="text-xs font-bold font-mono text-nx-ink">
                  {plan?.daysRemaining ?? 0} {t("profile.plan.daysUnit")}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-nx-line bg-nx-raised flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-nx-accent" />
              <div>
                <span className="text-[10px] text-nx-ink-3 block">
                  {t("profile.plan.supportPinLabel")}
                </span>
                <span className="text-xs font-bold font-mono text-nx-accent">
                  {plan?.rotatingSupportPin || "------"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Live Quota & Resource Consumption Gauges */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.plan.quotasTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.plan.quotasDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quotas.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.plan.noQuotas")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quotas.map((q) => (
                <div
                  key={q.quotaCode}
                  className="p-3.5 rounded-xl border border-nx-line bg-nx-raised space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-nx-ink truncate">{q.label}</span>
                    {q.isUnlimited ? (
                      <Badge variant="outline" className="font-mono text-[10px] border-nx-accent/40 text-nx-accent bg-nx-accent-wash">
                        &infin; {t("profile.plan.unlimited")}
                      </Badge>
                    ) : (
                      <span className="text-[11px] font-mono text-nx-ink-2">
                        {q.used} / {q.limit}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-nx-surface overflow-hidden">
                    <div
                      className="h-full bg-nx-accent rounded-full"
                      style={{
                        width: q.isUnlimited
                          ? "35%"
                          : `${Math.min(100, Math.round((q.used / Math.max(1, q.limit)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-nx-ink-3 block">
                    {q.quotaCode}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. 3-State Allowed Features & Entitlements Matrix */}
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
                  <p className="text-[11px] text-nx-ink-3 font-mono truncate">
                    {feat.featureCode}
                  </p>
                </div>

                {feat.state === "allowed" ? (
                  <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px] gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{t("profile.plan.stateAllowed")}</span>
                  </Badge>
                ) : feat.state === "club_owned_request_role" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmittingRequest}
                    onClick={() => handleRequestUpgrade(feat.featureCode, "REQUEST_ROLE")}
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
                    onClick={() => handleRequestUpgrade(feat.featureCode, "UPGRADE_EDITION")}
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
    </div>
  );
}
