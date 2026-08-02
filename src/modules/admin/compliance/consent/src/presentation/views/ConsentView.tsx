// FILE-EXCEPTION: file length
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { useConsentViewModel } from "../viewmodels/useConsentViewModel";
import type { ConsentStatus } from "../../domain/entities/ConsentStatus";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { StatCard } from "@core/ui/stat-card";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { Progress } from "@core/ui/progress";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { toast } from "@core/hooks/use-enhanced-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";
import { formatDateUtc } from "@core/common/utils";

// ── Consent row ───────────────────────────────────────────────────────────────

interface ConsentRowProps {
  consent: ConsentStatus;
  onRecord: (purposeId: string, action: "Granted" | "Withdrawn") => Promise<void>;
  onWithdraw: (purposeId: string) => void;
  isActing: boolean;
  canManage: boolean;
}

/**
 * Presentation UI component rendering one consent purpose and its controls.
 */
function ConsentRow({ consent, onRecord, onWithdraw, isActing, canManage }: ConsentRowProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-nx-md border ${
            consent.isGranted
              ? "border-success/30 bg-success/10 text-success"
              : "border-nx-line bg-nx-raised text-nx-ink-3"
          }`}
          aria-hidden="true"
        >
          {consent.isGranted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-tight text-nx-ink">{consent.purposeName}</p>
            {consent.requiresReConsent && (
              <Badge variant="destructive">
                <Bell className="h-3 w-3" aria-hidden="true" />
                {t("compliance.reConsentRequired")}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 font-mono text-xs text-nx-ink-3">{consent.purposeKey}</p>
          <p className="mt-1.5 text-xs text-nx-ink-2">
            {t("compliance.lastUpdated")}{" "}
            <span className="font-medium tabular-nums text-nx-ink">
              {formatDateUtc(consent.lastUpdatedAt)}
            </span>
            {" · "}
            {t("compliance.consentVersion")}{" "}
            <span className="font-medium tabular-nums text-nx-ink">{consent.consentVersion}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={consent.isGranted ? "success" : "inactive"}>
          {consent.isGranted ? t("compliance.granted") : t("compliance.withdrawn")}
        </Badge>
        {canManage &&
          (consent.isGranted ? (
            <Button
              id={`consent-withdraw-${consent.purposeId}`}
              variant="outline"
              size="sm"
              disabled={isActing}
              onClick={() => onWithdraw(consent.purposeId)}
            >
              {t("compliance.withdrawn")}
            </Button>
          ) : (
            <Button
              id={`consent-grant-${consent.purposeId}`}
              size="sm"
              disabled={isActing}
              onClick={() => onRecord(consent.purposeId, "Granted")}
            >
              {t("compliance.recordConsent")}
            </Button>
          ))}
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the consent view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ConsentView() {
  useModuleLocales(() => import("../../../locales"), "compliance-consent");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);
  const canViewAnalytics = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_CONSENT_VIEW_ANALYTICS);
  const { tenantCode } = useAppStore();
  const canManage = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_CONSENT_MANAGE) && !!tenantCode;

  const {
    consents,
    analytics,
    grantedCount,
    withdrawnCount,
    reConsentCount,
    isLoading,
    isError,
    isAnalyticsLoading,
    isAnalyticsError,
    refetch,
    recordConsent,
    withdrawConsent,
    isRecording,
    isWithdrawing,
  } = useConsentViewModel();

  const handleRecord = async (purposeId: string, action: "Granted" | "Withdrawn") => {
    try {
      await recordConsent({
        purposeId,
        action,
        consentVersion: "1.0",
        collectionMethod: "settings",
      });
      toast({ title: t("compliance.consentRecorded") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawTarget) return;
    try {
      await withdrawConsent(withdrawTarget);
      toast({ title: t("compliance.consentRecorded") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    } finally {
      setWithdrawTarget(null);
    }
  };

  const optInRates = analytics ? Object.entries(analytics.optInRates) : [];

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      <PageHeader
        className="mb-0"
        icon={ShieldCheck}
        title={t("compliance.consentTitle")}
        description={t("compliance.consentDescription")}
        eyebrow={
          <Button variant="ghost" size="sm" onClick={() => router.push("/compliance")}>
            <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("common.back")}
          </Button>
        }
        meta={[
          { label: t("compliance.granted"), value: grantedCount.toLocaleString() },
          { label: t("compliance.withdrawn"), value: withdrawnCount.toLocaleString() },
          { label: t("compliance.reConsentRequired"), value: reConsentCount.toLocaleString() },
        ]}
        actions={
          <Button
            id="compliance-consent-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            loading={isLoading}
          >
            {!isLoading && <RefreshCw className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />}
            {t("common.refresh")}
          </Button>
        }
      />

      <Tabs defaultValue="my-consents" className="space-y-4">
        {canViewAnalytics && (
          <TabsList>
            <TabsTrigger value="my-consents">{t("compliance.myConsents")}</TabsTrigger>
            <TabsTrigger value="analytics">{t("compliance.analytics")}</TabsTrigger>
          </TabsList>
        )}

        {/* Granted / withdrawn / re-consent live in the header's ruled meta
            strip — the page used to print the same three figures twice, once
            as a sentence under the title and again as three cards. */}
        <TabsContent value="my-consents" className="space-y-6">
          {isLoading ? (
            <div
              className="space-y-3"
              role="status"
              aria-busy="true"
              aria-label={t("common.loading")}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-nx-lg" />
              ))}
            </div>
          ) : isError ? (
            <ErrorMessage message={t("compliance.consentLoadFailed")} onRetry={() => refetch()} />
          ) : consents.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title={t("compliance.noConsents")}
              description={t("compliance.noConsentsDesc")}
            />
          ) : (
            <Card>
              <CardHeader className="border-b border-nx-line">
                <CardTitle className="text-base">{t("compliance.purposes")}</CardTitle>
                <CardDescription>{t("compliance.consentStatus")}</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-nx-line p-0">
                {consents.map((consent: ConsentStatus) => (
                  <ConsentRow
                    key={consent.purposeId}
                    consent={consent}
                    onRecord={handleRecord}
                    onWithdraw={setWithdrawTarget}
                    isActing={isRecording || isWithdrawing}
                    canManage={canManage}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {canViewAnalytics && (
          <TabsContent value="analytics" className="mt-4 space-y-6">
            {isAnalyticsLoading ? (
              <div
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                role="status"
                aria-busy="true"
                aria-label={t("common.loading")}
              >
                <Skeleton className="h-28 w-full rounded-nx-lg" />
                <Skeleton className="h-28 w-full rounded-nx-lg" />
                <Skeleton className="h-56 w-full rounded-nx-lg md:col-span-2" />
              </div>
            ) : isAnalyticsError || !analytics ? (
              <ErrorMessage message={t("compliance.analyticsLoadFailed")} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  label={t("compliance.totalSubjects")}
                  value={analytics.totalSubjects.toLocaleString()}
                  tone="neutral"
                />
                <StatCard
                  label={t("compliance.subjectsRequiringReConsent")}
                  value={analytics.subjectsRequiringReConsent.toLocaleString()}
                  icon={Bell}
                  tone="warning"
                />
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">{t("compliance.optInRates")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {optInRates.length === 0 ? (
                      <EmptyState bare size="sm" title={t("compliance.noAnalyticsData")} />
                    ) : (
                      optInRates.map(([purposeKey, rate]) => (
                        <div key={purposeKey} className="space-y-2">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate font-medium text-nx-ink">
                              {purposeKey}
                            </span>
                            <span className="shrink-0 tabular-nums text-nx-ink-2">
                              {rate.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={rate} className="h-2" aria-label={purposeKey} />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <ConfirmationDialog
        open={withdrawTarget !== null}
        onOpenChange={(open) => !open && setWithdrawTarget(null)}
        title={t("compliance.withdrawn")}
        description={t("compliance.withdrawConfirmDesc")}
        confirmText={t("compliance.withdrawn")}
        cancelText={t("common.cancel")}
        variant="destructive"
        isLoading={isWithdrawing}
        onConfirm={handleWithdrawConfirm}
      />
    </div>
  );
}
