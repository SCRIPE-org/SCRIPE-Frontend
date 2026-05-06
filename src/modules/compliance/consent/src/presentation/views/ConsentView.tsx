"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bell,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { useConsentViewModel } from "../viewmodels/useConsentViewModel";
import type { ConsentStatus } from "../../domain/entities/ConsentStatus";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { toast } from "@core/ui/use-toast";
import { GenericModal } from "@core/crud/components/generic-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";

// ── Consent Card ──────────────────────────────────────────────────────────────

function ConsentCard({
  consent,
  onRecord,
  onWithdraw,
  isActing,
  canManage,
}: {
  consent: ConsentStatus;
  onRecord: (purposeId: string, action: "Granted" | "Withdrawn") => Promise<void>;
  onWithdraw: (purposeId: string) => void;
  isActing: boolean;
  canManage: boolean;
}) {
  const { t } = useI18n();

  return (
    <Card
      className={`group overflow-hidden border transition-all hover:shadow-md ${
        consent.isGranted
          ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5"
          : "border-border/50 bg-card/60"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                consent.isGranted
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-muted bg-muted/50 text-muted-foreground"
              }`}
            >
              {consent.isGranted ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold leading-tight">{consent.purposeName}</p>
                {consent.requiresReConsent && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    <Bell className="me-1 h-2.5 w-2.5" />
                    {t("compliance.reConsentRequired")}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{consent.purposeKey}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("compliance.lastUpdated")}{" "}
                <span className="font-medium text-foreground">
                  {consent.lastUpdatedAt.toLocaleDateString()}
                </span>
                {" · "}
                {t("compliance.consentVersion")} <span className="font-medium text-foreground">{consent.consentVersion}</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant={consent.isGranted ? "default" : "secondary"}
              className={`${consent.isGranted ? "bg-emerald-500 hover:bg-emerald-500/80" : ""}`}
            >
              {consent.isGranted ? t("compliance.granted") : t("compliance.withdrawn")}
            </Badge>
            {canManage && (
              consent.isGranted ? (
                <Button
                  id={`consent-withdraw-${consent.purposeId}`}
                  variant="outline"
                  size="sm"
                  className="h-7 border-destructive/40 text-xs text-destructive hover:border-destructive hover:bg-destructive/10"
                  disabled={isActing}
                  onClick={() => onWithdraw(consent.purposeId)}
                >
                  {t("compliance.withdrawn")}
                </Button>
              ) : (
                <Button
                  id={`consent-grant-${consent.purposeId}`}
                  size="sm"
                  className="h-7 bg-emerald-600 text-xs hover:bg-emerald-700"
                  disabled={isActing}
                  onClick={() => onRecord(consent.purposeId, "Granted")}
                >
                  {t("compliance.recordConsent")}
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Withdraw Confirm Dialog (GenericModal) ────────────────────────────────────

function WithdrawConfirmDialog({
  open,
  onConfirm,
  onCancel,
  isWithdrawing,
}: {
  purposeId: string | null;
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isWithdrawing: boolean;
}) {
  const { t } = useI18n();
  return (
    <GenericModal
      open={open}
      onOpenChange={(v) => !v && onCancel()}
      title={t("compliance.withdrawn")}
      description={t("compliance.withdrawConfirmDesc")}
      size="sm"
    >
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button
          id="consent-withdraw-confirm"
          variant="destructive"
          disabled={isWithdrawing}
          onClick={onConfirm}
        >
          {isWithdrawing ? t("common.loading") : t("compliance.withdrawn")}
        </Button>
      </div>
    </GenericModal>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

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
      await recordConsent({ purposeId, action, consentVersion: "1.0", collectionMethod: "settings" });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/compliance")}>
            <BackIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-green-500/10 p-2.5 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("compliance.consentTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{grantedCount}</span> {t("compliance.granted")}
                {reConsentCount > 0 && (
                  <>
                    {" · "}
                    <span className="font-medium text-destructive">{reConsentCount}</span>{" "}
                    <span className="text-destructive">{t("compliance.reConsentRequired")}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <Button id="compliance-consent-refresh" variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      <Tabs defaultValue="my-consents" className="space-y-4">
        {canViewAnalytics && (
          <TabsList className="bg-muted/50">
            <TabsTrigger value="my-consents">{t("compliance.myConsents")}</TabsTrigger>
            <TabsTrigger value="analytics">{t("compliance.analytics")}</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="my-consents" className="space-y-6">
          {/* Summary stats */}
      {!isLoading && !isError && consents.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: t("compliance.granted"),
              value: grantedCount,
              icon: <CheckCircle2 className="h-4 w-4" />,
              cls: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/5 text-emerald-600 dark:text-emerald-400",
            },
            {
              label: t("compliance.withdrawn"),
              value: consents.length - grantedCount,
              icon: <XCircle className="h-4 w-4" />,
              cls: "border-border/50 bg-muted/30 text-muted-foreground",
            },
            {
              label: t("compliance.reConsentRequired"),
              value: reConsentCount,
              icon: <Bell className="h-4 w-4" />,
              cls: "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 text-amber-600 dark:text-amber-400",
            },
          ].map((s) => (
            <Card key={s.label} className={`border ${s.cls}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-background/60 p-2 shadow-sm">{s.icon}</div>
                <div>
                  <p className="text-xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-xs opacity-80">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[90px] rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("common.tryAgain")}</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      ) : consents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <BarChart3 className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="font-semibold">{t("compliance.noConsents")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("compliance.noConsentsDesc")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="border-b border-border/40 bg-muted/20 px-5 py-4">
              <CardTitle className="text-sm font-semibold">{t("compliance.purposes")}</CardTitle>
              <CardDescription className="text-xs">{t("compliance.consentStatus")}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 p-0">
              {consents.map((consent: ConsentStatus, idx) => (
                <div key={consent.purposeId} className={idx === 0 ? "pt-4 px-4 pb-4" : "p-4"}>
                  <ConsentCard
                    consent={consent}
                    onRecord={handleRecord}
                    onWithdraw={setWithdrawTarget}
                    isActing={isRecording || isWithdrawing}
                    canManage={canManage}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
        </TabsContent>

        {canViewAnalytics && (
          <TabsContent value="analytics" className="space-y-6 mt-4">
            {isAnalyticsLoading ? (
              <Skeleton className="h-[300px] rounded-xl" />
            ) : isAnalyticsError || !analytics ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                  <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
                  <p className="font-semibold">{t("common.error")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("compliance.totalSubjects")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.totalSubjects}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("compliance.subjectsRequiringReConsent")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-600">{analytics.subjectsRequiringReConsent}</div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>{t("compliance.optInRates")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(analytics.optInRates).map(([key, rate]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{rate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {Object.keys(analytics.optInRates).length === 0 && (
                      <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <WithdrawConfirmDialog
        purposeId={withdrawTarget}
        open={withdrawTarget !== null}
        onConfirm={handleWithdrawConfirm}
        onCancel={() => setWithdrawTarget(null)}
        isWithdrawing={isWithdrawing}
      />
    </div>
  );
}
