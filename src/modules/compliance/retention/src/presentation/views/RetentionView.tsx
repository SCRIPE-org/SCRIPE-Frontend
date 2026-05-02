"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Play,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";
import { useRetentionViewModel } from "../viewmodels/useRetentionViewModel";
import type { RetentionPolicy, UpdateRetentionPolicyRequest, ExpiryAction } from "../../domain/entities/RetentionPolicy";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { toast } from "@core/ui/use-toast";

// ── Category Icons ─────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  PersonalData: {
    label: "Personal Data",
    icon: <ShieldAlert className="h-4 w-4" />,
    cls: "border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 text-blue-600 dark:text-blue-400",
  },
  FinancialData: {
    label: "Financial Data",
    icon: <Archive className="h-4 w-4" />,
    cls: "border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 text-violet-600 dark:text-violet-400",
  },
  AuditLogs: {
    label: "Audit Logs",
    icon: <Clock className="h-4 w-4" />,
    cls: "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 text-amber-600 dark:text-amber-400",
  },
  MarketingData: {
    label: "Marketing Data",
    icon: <CheckCircle2 className="h-4 w-4" />,
    cls: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/5 text-emerald-600 dark:text-emerald-400",
  },
};

// ── Edit Policy Dialog ─────────────────────────────────────────────────────────

function EditPolicyDialog({
  policy,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: {
  policy: RetentionPolicy | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, retentionDays: number, expiryAction: string, isActive: boolean) => Promise<void>;
  isSaving: boolean;
}) {
  const { t } = useI18n();
  const [days, setDays] = useState(policy?.retentionDays ?? 365);
  const [action, setAction] = useState<ExpiryAction>(policy?.expiryAction ?? "Delete");
  const [active, setActive] = useState(policy?.isActive ?? true);

  const handleOpen = (v: boolean) => {
    if (v && policy) {
      setDays(policy.retentionDays);
      setAction(policy.expiryAction);
      setActive(policy.isActive);
    }
    onOpenChange(v);
  };

  const handleSave = async () => {
    if (!policy) return;
    await onSave(policy.id, days, action, active);
    onOpenChange(false);
  };

  if (!policy) return null;

  const meta = CATEGORY_META[policy.category] ?? CATEGORY_META.PersonalData;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`rounded-lg border p-1.5 ${meta.cls}`}>{meta.icon}</div>
            {t("compliance.updatePolicy")}
          </DialogTitle>
          <DialogDescription>{meta.label} · {t("compliance.retentionCategory")}: {policy.category}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ret-days">{t("compliance.retentionDays")}</Label>
            <Input
              id="ret-days"
              type="number"
              min={policy.minRetentionDays}
              max={policy.maxRetentionDays}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t("compliance.minRetention")}: {policy.minRetentionDays} · {t("compliance.maxRetention")}: {policy.maxRetentionDays}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ret-action">{t("compliance.expiryAction")}</Label>
            <Select value={action} onValueChange={(v) => setAction(v as ExpiryAction)}>
              <SelectTrigger id="ret-action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                <SelectItem value="Delete">{t("compliance.delete")}</SelectItem>
                <SelectItem value="Anonymize">{t("compliance.anonymize")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t("compliance.active")}</p>
              <p className="text-xs text-muted-foreground">{t("compliance.activePolicyDesc") ?? "Enable or disable this retention policy"}</p>
            </div>
            <Switch id="ret-active" checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button id="retention-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("common.loading") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Policy Card ────────────────────────────────────────────────────────────────

function PolicyCard({
  policy,
  onEdit,
  onTrigger,
  isTriggering,
}: {
  policy: RetentionPolicy;
  onEdit: (p: RetentionPolicy) => void;
  onTrigger: (id: string) => void;
  isTriggering: boolean;
}) {
  const { t } = useI18n();
  const meta = CATEGORY_META[policy.category] ?? CATEGORY_META.PersonalData;

  return (
    <Card className={`border transition-all hover:shadow-md ${!policy.isActive ? "opacity-60" : ""} ${meta.cls.split(" ").slice(0, 2).join(" ")}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.cls}`}>
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{meta.label}</p>
                <Badge variant={policy.isActive ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                  {policy.isActive ? t("compliance.active") : t("compliance.inactive")}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground font-mono">{policy.category}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              id={`retention-trigger-${policy.id}`}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={isTriggering || !policy.isActive}
              onClick={() => onTrigger(policy.id)}
            >
              <Play className="me-1.5 h-3 w-3" />
              {t("common.run") ?? "Run"}
            </Button>
            <Button
              id={`retention-edit-${policy.id}`}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onEdit(policy)}
            >
              <Pencil className="me-1.5 h-3 w-3" />
              {t("compliance.updatePolicy")}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-background/60 p-3 border border-border/30">
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{policy.retentionDays}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("compliance.retentionDays")}</p>
          </div>
          <div className="text-center border-x border-border/30">
            <p className="text-lg font-bold tabular-nums">{policy.retentionYears}y</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("compliance.retentionCategory")}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums">{policy.expiryAction}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("compliance.expiryAction")}</p>
          </div>
        </div>

        {policy.nextEvaluationAt && (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("compliance.nextEvaluation")}: <span className="ms-1 font-medium text-foreground">{policy.nextEvaluationAt.toLocaleDateString()}</span>
            </span>
            {policy.lastExecutionAt && (
              <span>
                {t("compliance.executionHistory")}: <span className="font-medium text-foreground">{policy.lastExecutionAt.toLocaleDateString()}</span>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function RetentionView() {
  useModuleLocales(() => import("../../../locales"), "compliance-retention");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const [editPolicy, setEditPolicy] = useState<RetentionPolicy | null>(null);
  const { policies, activeCount, totalCount, isLoading, isError, refetch, updatePolicy, triggerPolicy, isUpdating, isTriggering } =
    useRetentionViewModel();

  const handleSave = async (id: string, retentionDays: number, expiryAction: string, isActive: boolean) => {
    try {
      await updatePolicy({ id, data: { policyId: id, retentionDays, expiryAction, isActive } });
      toast({ title: t("compliance.policyUpdated") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const handleTrigger = async (id: string) => {
    try {
      await triggerPolicy(id);
      toast({ title: t("compliance.policyUpdated") });
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
            <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-purple-500/10 p-2.5 shadow-sm">
              <ShieldAlert className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("compliance.retentionTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{activeCount}</span> {t("compliance.active")}
                {" · "}
                <span className="font-medium text-foreground">{totalCount}</span> {t("compliance.total")}
              </p>
            </div>
          </div>
        </div>
        <Button id="compliance-retention-refresh" variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl" />
          ))}
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
      ) : policies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
              <ShieldAlert className="h-8 w-8 text-violet-500" />
            </div>
            <p className="font-semibold">{t("compliance.noPolicies")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {policies.map((policy: RetentionPolicy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onEdit={setEditPolicy}
              onTrigger={handleTrigger}
              isTriggering={isTriggering}
            />
          ))}
        </div>
      )}

      <EditPolicyDialog
        policy={editPolicy}
        open={editPolicy !== null}
        onOpenChange={(v) => { if (!v) setEditPolicy(null); }}
        onSave={handleSave}
        isSaving={isUpdating}
      />
    </div>
  );
}
