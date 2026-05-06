"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Clock,
  FileText,
  Shield,
} from "lucide-react";
import { useDsrViewModel } from "../viewmodels/useDsrViewModel";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { toast } from "@core/ui/use-toast";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";

// ── Constants ─────────────────────────────────────────────────────────────────

const SLA_COLORS: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Completed: "default",
  Approved: "default",
  InReview: "secondary",
  Processing: "secondary",
  Pending: "outline",
  PartiallyCompleted: "outline",
  Rejected: "destructive",
  Cancelled: "destructive",
};

const TYPE_COLORS: Record<string, string> = {
  Export: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Erasure: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Rectification: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Restriction: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Export: <FileText className="h-3.5 w-3.5" />,
  Erasure: <XCircle className="h-3.5 w-3.5" />,
  Rectification: <Shield className="h-3.5 w-3.5" />,
  Restriction: <Clock className="h-3.5 w-3.5" />,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SlaBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="flex min-w-[100px] items-center gap-2" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${SLA_COLORS[color] ?? "bg-muted-foreground"}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{percent}%</span>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className={`h-7 px-3 text-xs font-medium transition-all ${active ? "shadow-sm" : "opacity-70 hover:opacity-100"}`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

// ── Option constants ───────────────────────────────────────────────────────────

const DSR_TYPE_OPTIONS = [
  { value: "Export", labelKey: "compliance.requestTypes.export" },
  { value: "Erasure", labelKey: "compliance.requestTypes.erasure" },
  { value: "Rectification", labelKey: "compliance.requestTypes.rectification" },
  { value: "Restriction", labelKey: "compliance.requestTypes.restriction" },
];

const REGULATION_OPTIONS = [
  { value: "GDPR", labelKey: "compliance.regulations.gdpr" },
  { value: "CCPA", labelKey: "compliance.regulations.ccpa" },
  { value: "PDPA", labelKey: "compliance.regulations.pdpa" },
];

// ── Submit DSR Dialog ─────────────────────────────────────────────────────────

function SubmitDsrDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: {
    requestType: string;
    regulationCode: string;
    subjectEmail: string;
    requesterNotes?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    requestType: "Export",
    regulationCode: "GDPR",
    subjectEmail: "",
    requesterNotes: "",
  });

  const handleSubmit = async () => {
    if (!form.subjectEmail.trim()) return;
    await onSubmit(form);
    onOpenChange(false);
    setForm({ requestType: "Export", regulationCode: "GDPR", subjectEmail: "", requesterNotes: "" });
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("compliance.submitDsr")}
      description={t("compliance.submitDsrDesc")}
      size="md"
      formKey={open ? "dsr-submit" : undefined}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="dsr-subject-email">{t("compliance.subjectEmail")}</Label>
          <Input
            id="dsr-subject-email"
            type="email"
            placeholder="subject@example.com"
            value={form.subjectEmail}
            onChange={(e) => setForm((f) => ({ ...f, subjectEmail: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>{t("compliance.requestType")}</Label>
            <GenericSelect
              options={DSR_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              value={form.requestType}
              onValueChange={(v: string | string[]) => setForm((f) => ({ ...f, requestType: v as string }))}
              placeholder={t("compliance.requestType")}
              type="single"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("compliance.regulation")}</Label>
            <GenericSelect
              options={REGULATION_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              value={form.regulationCode}
              onValueChange={(v: string | string[]) => setForm((f) => ({ ...f, regulationCode: v as string }))}
              placeholder={t("compliance.regulation")}
              type="single"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dsr-notes">{t("compliance.requesterNotes")}</Label>
          <Textarea
            id="dsr-notes"
            placeholder={t("compliance.notesPlaceholder")}
            rows={3}
            value={form.requesterNotes}
            onChange={(e) => setForm((f) => ({ ...f, requesterNotes: e.target.value }))}
          />
        </div>
        {form.requestType === "Erasure" && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">{t("compliance.erasureGateWarning")}</p>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button
            id="dsr-submit-confirm"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.subjectEmail.trim()}
          >
            {isSubmitting ? t("common.loading") : t("compliance.submitDsr")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}

// ── Review Dialog ─────────────────────────────────────────────────────────────

function ReviewDsrDialog({
  dsr,
  open,
  onOpenChange,
  onReview,
  isReviewing,
}: {
  dsr: DataSubjectRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReview: (id: string, approved: boolean, resolution?: string) => Promise<void>;
  isReviewing: boolean;
}) {
  const { t } = useI18n();
  const [resolution, setResolution] = useState("");
  const [decision, setDecision] = useState<boolean | null>(null);

  const handleReview = async (approved: boolean) => {
    if (!dsr) return;
    setDecision(approved);
    await onReview(dsr.id, approved, resolution || undefined);
    onOpenChange(false);
    setResolution("");
    setDecision(null);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${t("compliance.approveDsr")} / ${t("compliance.rejectDsr")}`}
      description={dsr ? `${dsr.subjectEmail} · ${dsr.requestType} · ${dsr.regulationCode}` : ""}
      size="sm"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="review-resolution">{t("compliance.resolution")}</Label>
          <Textarea
            id="review-resolution"
            placeholder={t("compliance.resolutionPlaceholder")}
            rows={3}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button
            variant="destructive"
            id="dsr-reject-btn"
            disabled={isReviewing}
            onClick={() => handleReview(false)}
          >
            <ThumbsDown className="me-2 h-4 w-4" />
            {isReviewing && decision === false ? t("common.loading") : t("compliance.rejectDsr")}
          </Button>
          <Button
            id="dsr-approve-btn"
            disabled={isReviewing}
            onClick={() => handleReview(true)}
          >
            <ThumbsUp className="me-2 h-4 w-4" />
            {isReviewing && decision === true ? t("common.loading") : t("compliance.approveDsr")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function DsrView() {
  useModuleLocales(() => import("../../../locales"), "compliance-dsr");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const { tenantCode } = useAppStore();
  const canCreate = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_DSR_CREATE) && !!tenantCode;
  const canReview = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_DSR_REVIEW) && !!tenantCode;
  const canCancel = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_DSR_CANCEL) && !!tenantCode;

  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewDsr, setReviewDsr] = useState<DataSubjectRequest | null>(null);

  const { dsrs, totalCount, isLoading, isError, refetch, submitDsr, reviewDsr: doReview, cancelDsr, isSubmitting, isReviewing, isCancelling } =
    useDsrViewModel({ page, pageSize, status: statusFilter || undefined, requestType: typeFilter || undefined });

  const statuses = ["", "Pending", "InReview", "Approved", "Processing", "Completed", "Rejected", "Cancelled"];
  const types = ["", "Export", "Erasure", "Rectification", "Restriction"];
  const overdue = dsrs.filter((d) => d.isOverdue).length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSubmit = async (data: { requestType: string; regulationCode: string; subjectEmail: string; requesterNotes?: string }) => {
    try {
      await submitDsr({ requestType: data.requestType, regulationCode: data.regulationCode, subjectEmail: data.subjectEmail, requesterNotes: data.requesterNotes });
      toast({ title: t("compliance.dsrSubmitted"), description: `${data.requestType} · ${data.subjectEmail}` });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const handleReview = async (id: string, approved: boolean, resolution?: string) => {
    try {
      await doReview({ id, data: { isApproved: approved, resolution } });
      toast({ title: approved ? t("compliance.dsrApproved") : t("compliance.dsrRejected") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const handleCancel = async (dsr: DataSubjectRequest) => {
    try {
      await cancelDsr(dsr.id);
      toast({ title: t("compliance.dsrCancelled") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
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
            <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 p-2.5 shadow-sm">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("compliance.dsrTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalCount}</span> {t("compliance.total")}
                {overdue > 0 && (
                  <>
                    {" · "}
                    <span className="font-medium text-destructive">{overdue}</span>{" "}
                    <span className="text-destructive">{t("compliance.overdue")}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button id="compliance-dsr-refresh" variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>
          {canCreate && (
            <Button id="compliance-dsr-new" size="sm" onClick={() => setSubmitOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              {t("compliance.submitDsr")}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="me-1 text-xs font-medium text-muted-foreground">{t("compliance.status")}:</span>
            {statuses.map((s) => (
              <FilterPill
                key={s || "all-status"}
                label={s ? t(`compliance.${s.charAt(0).toLowerCase() + s.slice(1)}`) : t("common.all")}
                active={statusFilter === s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="me-1 text-xs font-medium text-muted-foreground">{t("compliance.requestType")}:</span>
            {types.map((type) => (
              <FilterPill
                key={type || "all-types"}
                label={type ? t(`compliance.${type.toLowerCase()}`) : t("compliance.allTypes")}
                active={typeFilter === type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
          <CardTitle className="text-base font-semibold">{t("compliance.dsrTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0 divide-y divide-border/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-2 w-24 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <p className="font-medium text-foreground">{t("common.error")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("common.tryAgain")}</p>
              <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="me-2 h-4 w-4" />
                {t("common.refresh")}
              </Button>
            </div>
          ) : dsrs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="font-medium">{t("compliance.noDsrs")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("compliance.noDsrsDesc")}</p>
              <Button className="mt-4" size="sm" onClick={() => setSubmitOpen(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t("compliance.submitDsr")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="ps-6">{t("compliance.subject")}</TableHead>
                  <TableHead>{t("compliance.requestType")}</TableHead>
                  <TableHead>{t("compliance.status")}</TableHead>
                  <TableHead>{t("compliance.sla")}</TableHead>
                  <TableHead>{t("compliance.deadline")}</TableHead>
                  <TableHead className="w-10 pe-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {dsrs.map((dsr: DataSubjectRequest) => (
                  <TableRow key={dsr.id} className="group cursor-pointer transition-colors hover:bg-muted/40">
                    <TableCell className="ps-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 font-semibold text-sm text-blue-600 dark:text-blue-400">
                          {dsr.subjectEmail.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{dsr.subjectEmail}</p>
                          <p className="text-xs text-muted-foreground">{dsr.regulationCode}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[dsr.requestType] ?? ""}`}>
                        {TYPE_ICONS[dsr.requestType]}
                        {t(`compliance.${dsr.requestType.toLowerCase()}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[dsr.status] ?? "outline"}>{t(`compliance.${dsr.status.charAt(0).toLowerCase() + dsr.status.slice(1)}`)}</Badge>
                    </TableCell>
                    <TableCell>
                      <SlaBar percent={dsr.slaPercent} color={dsr.slaColor} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {dsr.isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                        {dsr.isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        <span className="text-xs text-muted-foreground">
                          {dsr.daysRemaining > 0
                            ? `${dsr.daysRemaining}d ${t("compliance.remaining")}`
                            : dsr.isCompleted
                              ? t("compliance.completed")
                              : t("compliance.overdue")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pe-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            id={`dsr-actions-${dsr.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => router.push(`/compliance/dsr/${dsr.id}`)}>
                            <Eye className="me-2 h-4 w-4" />
                            {t("compliance.viewDetail")}
                          </DropdownMenuItem>
                          {canReview && (dsr.status === "Pending" || dsr.status === "InReview") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setReviewDsr(dsr)}>
                                <ThumbsUp className="me-2 h-4 w-4 text-emerald-500" />
                                {t("compliance.approveDsr")} / {t("compliance.rejectDsr")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {canCancel && (dsr.status === "Pending" || dsr.status === "Approved") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleCancel(dsr)}
                                disabled={isCancelling}
                              >
                                <XCircle className="me-2 h-4 w-4" />
                                {t("compliance.cancelDsr")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("common.showing")} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} {t("common.of")} {totalCount}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-medium">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <SubmitDsrDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <ReviewDsrDialog
        dsr={reviewDsr}
        open={reviewDsr !== null}
        onOpenChange={(v) => { if (!v) setReviewDsr(null); }}
        onReview={handleReview}
        isReviewing={isReviewing}
      />
    </div>
  );
}
