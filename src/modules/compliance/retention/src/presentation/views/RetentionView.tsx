"use client";

import { useRouter } from "next/navigation";
import { Clock, ChevronLeft, Trash2, Layers, RefreshCw } from "lucide-react";
import { useRetentionViewModel } from "../viewmodels/useRetentionViewModel";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Separator } from "@core/ui/separator";

function PolicyCard({ policy, t }: { policy: RetentionPolicy; t: (k: string) => string }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-2 ${policy.isAnonymize ? "bg-teal-500/10" : "bg-rose-500/10"}`}
            >
              {policy.isAnonymize ? (
                <Layers className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              ) : (
                <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm">{policy.category}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {policy.legalBasis || "—"}
              </CardDescription>
            </div>
          </div>
          <Badge variant={policy.isActive ? "default" : "secondary"} className="flex-shrink-0">
            {policy.isActive ? t("compliance.active") : t("compliance.inactive")}
          </Badge>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">{t("compliance.minRetention")}</p>
            <p className="mt-0.5 font-semibold">{policy.minRetentionDays}d</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("compliance.maxRetention")}</p>
            <p className="mt-0.5 font-semibold">{policy.maxRetentionDays}d</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("compliance.expiryAction")}</p>
            <p
              className={`mt-0.5 font-semibold ${policy.isAnonymize ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}
            >
              {policy.isAnonymize ? t("compliance.anonymize") : t("compliance.delete")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("compliance.nextEvaluation")}</p>
            <p className="mt-0.5 font-semibold">
              {policy.nextEvaluationAt?.toLocaleDateString() ?? "—"}
            </p>
          </div>
        </div>
        {policy.lastExecutionAt && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t("compliance.executionHistory")}: {policy.lastExecutionAt.toLocaleDateString()}
              </span>
              {policy.recordsProcessedLast != null && (
                <span>
                  {policy.recordsProcessedLast} {t("compliance.recordsProcessed")}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function RetentionView() {
  useModuleLocales(() => import("../../../locales"), "compliance-retention");
  const { t } = useI18n();
  const router = useRouter();
  const { policies, activeCount, totalCount, isLoading, refetch } = useRetentionViewModel();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/compliance")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("compliance.retentionPolicies")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeCount} {t("compliance.active")} · {totalCount} total
            </p>
          </div>
        </div>
        <Button
          id="compliance-retention-refresh"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
        >
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      ) : policies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">{t("compliance.noPolicies")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {policies.map((p: RetentionPolicy) => (
            <PolicyCard key={p.id} policy={p} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
