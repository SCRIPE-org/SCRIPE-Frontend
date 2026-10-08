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
    <Card className="shadow-xs border-border bg-card p-4">
      {/* Section Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t("tenantCommandCenter.getStarted.title") || "Get Started"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.getStarted.subtitle") ||
                "Finish the essentials to unlock the full SCRIPE workspace."}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-primary">
          {t("tenantCommandCenter.getStarted.progress", {
            completed: completedCount,
            total: totalCount,
          }) || `${completedCount} of ${totalCount} completed`}
        </span>
      </div>

      {/* 5 Steps Responsive Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {steps.map((step) => {
          const isDone = step.status === "done";
          const isCurrent = step.status === "current";

          return (
            <div
              key={step.id}
              className={`flex min-h-[136px] flex-col justify-between rounded-xl border p-3 transition-colors ${
                isCurrent
                  ? "shadow-xs border-primary/50 bg-primary/5"
                  : isDone
                    ? "border-border bg-muted/20"
                    : "border-border bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
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
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      {t("tenantCommandCenter.getStarted.nextUp")}
                    </span>
                  )}
                </div>

                <h4 className="mt-2.5 text-xs font-bold leading-tight text-foreground">
                  {step.title}
                </h4>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  {step.description}
                </p>
              </div>

              <div className="mt-3 pt-2">
                {isDone ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                    <Check className="h-3 w-3" />
                    <span>{t("tenantCommandCenter.getStarted.completed")}</span>
                  </span>
                ) : (
                  <Button
                    asChild
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-full text-[10px] font-semibold"
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
