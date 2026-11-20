"use client";

import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Crown, KeyRound, Calendar } from "lucide-react";
import type { SovereignPlanSlice } from "../../../domain/entities/SovereignAccountEntities";

/**
 * Props for PlanEditionBannerSection.
 */
export interface PlanEditionBannerSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  plan: SovereignPlanSlice | undefined;
}

/**
 * Top edition, contract countdown, and rotating support verification PIN banner for /account/plan.
 */
export function PlanEditionBannerSection({ t, plan }: PlanEditionBannerSectionProps) {
  return (
    <Card
      data-testid="account-plan-edition-banner"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Crown className="h-4 w-4 text-nx-accent" />
            <span className="text-sm font-bold text-nx-ink">{plan?.editionName || ""}</span>
            {plan?.isPlatformSovereign && (
              <Badge
                variant="outline"
                className="border-nx-accent/40 text-nx-accent bg-nx-accent-wash text-[10px] font-mono"
              >
                {t("profile.plan.platformSovereignBadge")}
              </Badge>
            )}
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
          {plan?.tierTagline && (
            <p className="text-xs font-medium text-nx-ink">{plan.tierTagline}</p>
          )}
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
                {plan?.isPlatformSovereign
                  ? t("profile.plan.unlimited")
                  : `${plan?.daysRemaining ?? 0} ${t("profile.plan.daysUnit")}`}
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
  );
}
