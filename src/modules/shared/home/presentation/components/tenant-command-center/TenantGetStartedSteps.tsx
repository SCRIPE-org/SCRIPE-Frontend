"use client";

import React from "react";
import { Rocket, Check } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
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
    <Card className="min-w-0 overflow-hidden border-nx-line bg-nx-surface p-4 text-nx-ink hover:border-nx-line-hi sm:p-5">
      {/* Section Header */}
      <div className="mb-3.5 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md"
            style={{
              background: "color-mix(in oklch, var(--nx-accent) 12%, transparent)",
              color: "var(--nx-accent)",
            }}
          >
            <Rocket className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-nx-ink">
              {t("tenantCommandCenter.getStarted.title") || "Get Started"}
            </h3>
            <p className="truncate text-xs text-nx-ink-3">
              {t("tenantCommandCenter.getStarted.subtitle") ||
                "Finish the essentials to unlock the full SCRIPE workspace."}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-xs font-semibold text-nx-accent">
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
              className={cn(
                "group flex min-h-[136px] min-w-0 flex-col justify-between rounded-nx-md border p-3.5 transition-[color,background-color,border-color] duration-nx-micro ease-nx-enter",
                isCurrent
                  ? "border-nx-accent bg-nx-accent-wash"
                  : isDone
                    ? "bg-nx-raised/40 border-nx-line"
                    : "border-nx-line bg-transparent hover:border-nx-line-hi hover:bg-nx-raised"
              )}
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center justify-between gap-1.5">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                      isDone
                        ? "border-success/40 bg-success/15 text-success"
                        : isCurrent
                          ? "border-nx-accent bg-nx-accent text-nx-on-fill"
                          : "border-nx-line bg-nx-raised text-nx-ink-3"
                    )}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : step.id}
                  </div>
                  {isCurrent && (
                    <span className="bg-nx-accent/10 shrink-0 rounded-nx-sm px-1.5 py-0.5 text-[9px] font-bold text-nx-accent">
                      {t("tenantCommandCenter.getStarted.nextUp")}
                    </span>
                  )}
                </div>

                <h4
                  className="mt-2 truncate text-xs font-semibold leading-tight text-nx-ink"
                  title={step.title}
                >
                  {step.title}
                </h4>
                <p
                  className="mt-1 line-clamp-2 text-[11px] leading-snug text-nx-ink-3"
                  title={step.description}
                >
                  {step.description}
                </p>
              </div>

              <div className="mt-3.5 min-w-0 pt-1">
                {isDone ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {t("tenantCommandCenter.getStarted.completed")}
                    </span>
                  </span>
                ) : (
                  <Button
                    asChild
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-full truncate border-nx-line text-[11px] font-semibold"
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
