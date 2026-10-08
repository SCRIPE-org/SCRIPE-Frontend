"use client";

import React from "react";
import { Rocket, Check } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import type { TenantStepItem } from "./tenantTypes";

interface TenantGetStartedStepsProps {
  steps: TenantStepItem[];
  completedCount: number;
  totalCount: number;
}

export function TenantGetStartedSteps({
  steps,
  completedCount,
  totalCount,
}: TenantGetStartedStepsProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-xs border-border bg-card p-3.5 sm:p-4 min-w-0 overflow-hidden">
      {/* Section Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Rocket className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">
              {t("tenantCommandCenter.getStarted.title") || "Get Started"}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {t("tenantCommandCenter.getStarted.subtitle") ||
                "Finish the essentials to unlock the full SCRIPE workspace."}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-primary shrink-0">
          {t("tenantCommandCenter.getStarted.progress", {
            completed: completedCount,
            total: totalCount,
          }) || `${completedCount} of ${totalCount} completed`}
        </span>
      </div>

      {/* Steps Container Grid */}
      <div className="getstarted-container-grid">
        {steps.map((step) => {
          const isDone = step.status === "done";
          const isCurrent = step.status === "current";

          return (
            <div
              key={step.id}
              className={`flex min-h-[128px] flex-col justify-between rounded-xl border p-3 min-w-0 transition-colors ${
                isCurrent
                  ? "shadow-xs border-primary/50 bg-primary/5"
                  : isDone
                    ? "border-border bg-muted/20"
                    : "border-border bg-card"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                      isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isCurrent
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : step.id}
                  </div>
                  {isCurrent && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary shrink-0">
                      {t("tenantCommandCenter.getStarted.nextUp")}
                    </span>
                  )}
                </div>

                <h4 className="mt-2 text-xs font-bold leading-tight text-foreground truncate" title={step.title}>
                  {step.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground" title={step.description}>
                  {step.description}
                </p>
              </div>

              <div className="mt-3 pt-1 min-w-0">
                {isDone ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                    <Check className="h-3 w-3 shrink-0" />
                    <span className="truncate">{t("tenantCommandCenter.getStarted.completed")}</span>
                  </span>
                ) : (
                  <Button
                    asChild
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-full text-[10px] font-semibold truncate"
                  >
                    <Link href={step.href || "/settings"}>
                      {step.actionLabel || t("tenantCommandCenter.getStarted.start")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
