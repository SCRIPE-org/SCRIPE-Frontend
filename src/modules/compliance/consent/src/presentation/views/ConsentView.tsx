"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ChevronLeft, RefreshCw, Users } from "lucide-react";
import { useConsentViewModel } from "../viewmodels/useConsentViewModel";
import type { ConsentStatus } from "../../domain/entities/ConsentStatus";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

// ── Consent Card ──────────────────────────────────────────────────────────────

function ConsentCard({ consent, t }: { consent: ConsentStatus; t: (k: string) => string }) {
  return (
    <Card
      className={`transition-all hover:shadow-md ${
        consent.isGranted
          ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5"
          : "border-muted"
      }`}
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-2 ${consent.isGranted ? "bg-emerald-500/10" : "bg-muted"}`}
            >
              {consent.isGranted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm">{consent.purposeName}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">{consent.purposeKey}</CardDescription>
            </div>
          </div>
          <Badge variant={consent.isGranted ? "default" : "secondary"} className="flex-shrink-0">
            {consent.isGranted ? t("compliance.granted") : t("compliance.withdrawn")}
          </Badge>
        </div>

        {consent.requiresReConsent && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-amber-500" />
            {t("compliance.requiresReConsent")}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {t("compliance.lastUpdated")}: {consent.lastUpdatedAt.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function ConsentView() {
  useModuleLocales(() => import("../../../locales"), "compliance-consent");
  const { t } = useI18n();
  const router = useRouter();
  const { consents, grantedCount, withdrawnCount, reConsentCount, isLoading, refetch } =
    useConsentViewModel();

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-2.5">
            <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("compliance.consentTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {grantedCount} {t("compliance.granted")} · {withdrawnCount}{" "}
              {t("compliance.withdrawn")} · {reConsentCount} {t("compliance.requiresReConsent")}
            </p>
          </div>
        </div>
        <Button
          id="compliance-consent-refresh"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
        >
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-xl" />
          ))}
        </div>
      ) : consents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">{t("compliance.noConsents")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {consents.map((c: ConsentStatus) => (
            <ConsentCard key={c.purposeId} consent={c} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
