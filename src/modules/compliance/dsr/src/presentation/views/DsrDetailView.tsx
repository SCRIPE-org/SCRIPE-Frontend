"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Info,
  Server,
  User,
  Activity,
  History,
  FileCheck
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { toast } from "@core/ui/use-toast";
import { complianceContainer } from "@modules/compliance/di";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";

// ── Status meta ────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { labelKey: string; icon: React.ReactNode; cls: string }> = {
  Pending: { labelKey: "compliance.statusLabels.pending", icon: <Clock className="h-4 w-4 text-amber-500" />, cls: "border-amber-500/20 bg-amber-500/10 text-amber-600" },
  InReview: { labelKey: "compliance.statusLabels.inReview", icon: <Info className="h-4 w-4 text-blue-500" />, cls: "border-blue-500/20 bg-blue-500/10 text-blue-600" },
  Approved: { labelKey: "compliance.statusLabels.approved", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" },
  Processing: { labelKey: "compliance.statusLabels.processing", icon: <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />, cls: "border-indigo-500/20 bg-indigo-500/10 text-indigo-600" },
  PartiallyCompleted: { labelKey: "compliance.statusLabels.partiallyCompleted", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" },
  Completed: { labelKey: "compliance.statusLabels.completed", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" },
  Rejected: { labelKey: "compliance.statusLabels.rejected", icon: <AlertTriangle className="h-4 w-4 text-destructive" />, cls: "border-destructive/20 bg-destructive/10 text-destructive" },
  Cancelled: { labelKey: "compliance.statusLabels.cancelled", icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />, cls: "border-border/50 bg-muted/50 text-muted-foreground" },
};

// ── Type Meta ────────────────────────────────────────────────────────────────
const TYPE_META: Record<string, { labelKey: string; color: string }> = {
  Export: { labelKey: "compliance.requestTypes.export", color: "text-blue-500" },
  Erasure: { labelKey: "compliance.requestTypes.erasure", color: "text-destructive" },
  Rectification: { labelKey: "compliance.requestTypes.rectification", color: "text-amber-500" },
  Restriction: { labelKey: "compliance.requestTypes.restriction", color: "text-indigo-500" },
};

export function DsrDetailView({ id }: { id: string }) {
  useModuleLocales(() => import("../../../locales"), "compliance-dsr");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
  const { dsrRepository } = complianceContainer;
  const queryClient = useQueryClient();

  const [isConfirmingErasure, setIsConfirmingErasure] = useState(false);
  const [erasureInput, setErasureInput] = useState("");

  const query = useQuery({
    queryKey: ["compliance", "dsr", id],
    queryFn: () => dsrRepository.getById(id),
    refetchInterval: (query) => {
      const r = query.state.data as DataSubjectRequest | undefined;
      return r && (r.status === "Processing" || r.status === "InReview") ? 5_000 : false;
    },
  });

  const confirmErasureMutation = useMutation({
    mutationFn: () => dsrRepository.confirmErasure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "dsr", id] });
      setIsConfirmingErasure(false);
      setErasureInput("");
      toast({ title: t("compliance.erasureConfirmed"), variant: "default" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const downloadMutation = useMutation({
    mutationFn: () => dsrRepository.downloadExport(id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsr-export-${id}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("common.success"), variant: "default" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const dsr = query.data;
  const statusMeta = dsr ? (STATUS_META[dsr.status] ?? STATUS_META.Pending) : null;
  const typeMeta = dsr ? (TYPE_META[dsr.requestType] ?? { labelKey: dsr.requestType, color: "" }) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/compliance/dsr")}>
            <BackIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 p-2.5">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("compliance.dsrDetailTitle")}</h2>
              <p className="text-sm text-muted-foreground">{dsr?.subjectEmail ?? t("common.loading")}</p>
            </div>
          </div>
        </div>

        {dsr && (
          <div className="flex items-center gap-2">
            {dsr.canConfirmErasure && (
              <Button variant="destructive" onClick={() => setIsConfirmingErasure(true)}>
                <ShieldAlert className="me-2 h-4 w-4" />
                {t("compliance.confirmErasureBtn")}
              </Button>
            )}
            {dsr.canDownloadExport && (
              <Button onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
                {downloadMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Download className="me-2 h-4 w-4" />}
                {t("compliance.downloadExportBtn")}
              </Button>
            )}
          </div>
        )}
      </div>

      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
        </div>
      ) : query.isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={() => query.refetch()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      ) : dsr && statusMeta && typeMeta ? (
        <>
          {/* Top Metadata */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.requestType")}</p>
                <div className={`font-medium ${typeMeta.color}`}>
                  {t(typeMeta.labelKey)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.status")}</p>
                <Badge variant="outline" className={`w-fit gap-1 ${statusMeta.cls} border-0 px-2`}>
                  {statusMeta.icon}
                  {t(statusMeta.labelKey)}
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.deadline")}</p>
                <p className="font-medium text-sm">
                  {dsr.deadline.toLocaleDateString()}
                  {dsr.daysRemaining > 0 && <span className="ms-2 text-xs text-muted-foreground">({dsr.daysRemaining} {t("compliance.remaining")})</span>}
                  {dsr.isOverdue && <span className="ms-2 text-xs text-destructive">({t("compliance.overdue")})</span>}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col justify-center">
                <p className="text-xs text-muted-foreground mb-1">{t("compliance.columns.regulation")}</p>
                <p className="font-mono text-sm font-medium">{dsr.regulationCode}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column: Details & Modules */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {t("compliance.details")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">{t("compliance.columns.subjectEmail")}</p>
                    <p className="text-sm text-muted-foreground">{dsr.subjectEmail} ({dsr.subjectType})</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("compliance.submittedAt")}</p>
                    <p className="text-sm text-muted-foreground">{new Date(dsr.submittedAt).toLocaleString()}</p>
                  </div>
                  {dsr.completedAt && (
                    <div>
                      <p className="text-sm font-medium">{t("compliance.completedAt")}</p>
                      <p className="text-sm text-muted-foreground">{new Date(dsr.completedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {dsr.requesterNotes && (
                    <div>
                      <p className="text-sm font-medium">{t("compliance.requesterNotes")}</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">{dsr.requesterNotes}</p>
                    </div>
                  )}
                  {dsr.resolution && (
                    <div>
                      <p className="text-sm font-medium">{t("compliance.resolution")}</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">{dsr.resolution}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {dsr.moduleExecutions && dsr.moduleExecutions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      {t("compliance.moduleExecutions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dsr.moduleExecutions.map((exec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          {exec.isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : exec.errorMessage ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{exec.moduleName}</p>
                            {exec.errorMessage && <p className="text-xs text-destructive">{exec.errorMessage}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{exec.processedCount} {t("compliance.records")}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Timeline */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    {t("compliance.statusHistory")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dsr.statusHistory?.map((history, idx) => {
                      const isLast = idx === dsr.statusHistory.length - 1;
                      const fromMeta = STATUS_META[history.fromStatus] ?? STATUS_META.Pending;
                      const toMeta = STATUS_META[history.toStatus] ?? STATUS_META.Pending;
                      return (
                        <div key={idx} className="relative pl-6">
                          {!isLast && <div className="absolute left-[11px] top-6 h-full w-[2px] bg-border" />}
                          <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border bg-background flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium flex items-center gap-2">
                              {t(fromMeta.labelKey)} <ArrowRight className="h-3 w-3" /> {t(toMeta.labelKey)}
                            </p>
                            <p className="text-xs text-muted-foreground">{new Date(history.occurredAt).toLocaleString()}</p>
                            {history.notes && <p className="text-sm mt-1 text-muted-foreground">{history.notes}</p>}
                          </div>
                        </div>
                      );
                    })}
                    {(!dsr.statusHistory || dsr.statusHistory.length === 0) && (
                      <p className="text-sm text-muted-foreground">{t("compliance.noHistory")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Erasure State Info */}
              {dsr.requestType === "Erasure" && (
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardContent className="flex items-start gap-3 p-4">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        {t("compliance.erasureStatusTitle")}
                      </p>
                      <p className="mt-0.5 text-xs text-amber-600/70 dark:text-amber-400/70">
                        {dsr.erasureConfirmed 
                          ? t("compliance.erasureScheduledDesc")
                          : t("compliance.erasurePendingDesc")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Erasure Confirmation Dialog */}
      <Dialog open={isConfirmingErasure} onOpenChange={setIsConfirmingErasure}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t("compliance.confirmErasureDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("compliance.confirmErasureDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm font-medium">
              {t("compliance.typeConfirmToContinue")}
            </p>
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
              onClick={() => confirmErasureMutation.mutate()} 
              disabled={erasureInput !== "CONFIRM" || confirmErasureMutation.isPending}
            >
              {confirmErasureMutation.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("compliance.executeErasureBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
