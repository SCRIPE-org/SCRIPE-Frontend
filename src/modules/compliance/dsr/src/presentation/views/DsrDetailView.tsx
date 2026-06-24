"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Info,
  User,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { useDsrDetailViewModel } from "../viewmodels/useDsrDetailViewModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";

import { DsrDetailMetadata } from "../components/DsrDetailMetadata";
import { DsrDetailInfo } from "../components/DsrDetailInfo";
import { DsrModuleExecutions } from "../components/DsrModuleExecutions";
import { DsrDetailTimeline } from "../components/DsrDetailTimeline";
import { DsrErasureState } from "../components/DsrErasureState";

// ── Status meta ────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { labelKey: string; icon: React.ReactNode; cls: string }> = {
  Pending: {
    labelKey: "compliance.statusLabels.pending",
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    cls: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  },
  InReview: {
    labelKey: "compliance.statusLabels.inReview",
    icon: <Info className="h-4 w-4 text-blue-500" />,
    cls: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  },
  Approved: {
    labelKey: "compliance.statusLabels.approved",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  Processing: {
    labelKey: "compliance.statusLabels.processing",
    icon: <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />,
    cls: "border-indigo-500/20 bg-indigo-500/10 text-indigo-600",
  },
  PartiallyCompleted: {
    labelKey: "compliance.statusLabels.partiallyCompleted",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  Completed: {
    labelKey: "compliance.statusLabels.completed",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  Rejected: {
    labelKey: "compliance.statusLabels.rejected",
    icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
    cls: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  Cancelled: {
    labelKey: "compliance.statusLabels.cancelled",
    icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
    cls: "border-border/50 bg-muted/50 text-muted-foreground",
  },
};

// ── Type Meta ────────────────────────────────────────────────────────────────
const TYPE_META: Record<string, { labelKey: string; color: string }> = {
  Export: { labelKey: "compliance.requestTypes.export", color: "text-blue-500" },
  Erasure: { labelKey: "compliance.requestTypes.erasure", color: "text-destructive" },
  Rectification: { labelKey: "compliance.requestTypes.rectification", color: "text-amber-500" },
  Restriction: { labelKey: "compliance.requestTypes.restriction", color: "text-indigo-500" },
};

/**
 * React presentation component representing the dsr detail view UI element.
 */
export function DsrDetailView({ id }: { id: string }) {
  useModuleLocales(() => import("../../../locales"), "compliance-dsr");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
  const {
    dsr,
    isLoading,
    isError,
    refetch,
    isConfirmingErasure,
    setIsConfirmingErasure,
    erasureInput,
    setErasureInput,
    tenantCode,
    isConfirmingPending,
    isDownloadingPending,
    confirmErasure,
    downloadExport,
  } = useDsrDetailViewModel(id);
  const statusMeta = dsr ? (STATUS_META[dsr.status] ?? STATUS_META.Pending) : null;
  const typeMeta = dsr
    ? (TYPE_META[dsr.requestType] ?? { labelKey: dsr.requestType, color: "" })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/compliance/dsr")}
          >
            <BackIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 p-2.5">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("compliance.dsrDetailTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {dsr?.subjectEmail ?? t("common.loading")}
              </p>
            </div>
          </div>
        </div>

        {dsr && (
          <div className="flex items-center gap-2">
            {dsr.canConfirmErasure && !!tenantCode && (
              <Button variant="destructive" onClick={() => setIsConfirmingErasure(true)}>
                <ShieldAlert className="me-2 h-4 w-4" />
                {t("compliance.confirmErasureBtn")}
              </Button>
            )}
            {dsr.canDownloadExport && !!tenantCode && (
              <Button onClick={downloadExport} disabled={isDownloadingPending}>
                {isDownloadingPending ? (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="me-2 h-4 w-4" />
                )}
                {t("compliance.downloadExportBtn")}
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
        </div>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      ) : dsr && statusMeta && typeMeta ? (
        <>
          <DsrDetailMetadata dsr={dsr} t={t} statusMeta={statusMeta} typeMeta={typeMeta} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <DsrDetailInfo dsr={dsr} t={t} />
              <DsrModuleExecutions dsr={dsr} t={t} />
            </div>

            <div className="space-y-6">
              <DsrDetailTimeline dsr={dsr} t={t} statusMetaMap={STATUS_META} />
              <DsrErasureState dsr={dsr} t={t} />
            </div>
          </div>
        </>
      ) : null}

      <Dialog open={isConfirmingErasure} onOpenChange={setIsConfirmingErasure}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("compliance.confirmErasureDialogTitle")}
            </DialogTitle>
            <DialogDescription>{t("compliance.confirmErasureDialogDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">{t("compliance.typeConfirmToContinue")}</p>
            <Input
              value={erasureInput}
              onChange={(e) => setErasureInput(e.target.value)}
              placeholder="CONFIRM"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingErasure(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmErasure}
              disabled={erasureInput !== "CONFIRM" || isConfirmingPending}
            >
              {isConfirmingPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("compliance.executeErasureBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
