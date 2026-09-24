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
    <Card className="p-4 border-border bg-card shadow-xs">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {steps.map((step) => {
          const isDone = step.status === "done";
          const isCurrent = step.status === "current";

          return (
            <div
              key={step.id}
              className={`min-h-[136px] rounded-xl p-3 border flex flex-col justify-between transition-colors ${
                isCurrent
                  ? "border-primary/50 bg-primary/5 shadow-xs"
                  : isDone
                  ? "border-border bg-muted/20"
                  : "border-border bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      isDone
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : isCurrent
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : step.id}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                      {t("tenantCommandCenter.getStarted.nextUp")}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-foreground mt-2.5 leading-tight">
                  {step.title}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                  {step.description}
                </p>
              </div>

              <div className="mt-3 pt-2">
                {isDone ? (
                  <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>{t("tenantCommandCenter.getStarted.completed")}</span>
                  </span>
                ) : (
                  <Button
                    asChild
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    className="w-full h-7 text-[10px] font-semibold"
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
