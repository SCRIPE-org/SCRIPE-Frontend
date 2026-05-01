"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, RefreshCw, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";
import { useDsrViewModel } from "../viewmodels/useDsrViewModel";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";

// ── SLA Progress Bar ──────────────────────────────────────────────────────────

const SLA_COLORS: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

function SlaBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="flex min-w-[80px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${SLA_COLORS[color] ?? "bg-muted-foreground"}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-muted-foreground">{percent}%</span>
    </div>
  );
}

// ── Status → Badge variant ────────────────────────────────────────────────────

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

// ── Filter Toggle ─────────────────────────────────────────────────────────────

function FilterToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function DsrView() {
  useModuleLocales(() => import("../../../locales"), "compliance-dsr");
  const { t } = useI18n();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { dsrs, totalCount, isLoading, refetch } = useDsrViewModel({
    page: 1,
    pageSize: 50,
    status: statusFilter || undefined,
    requestType: typeFilter || undefined,
  });

  const statuses = [
    "",
    "Pending",
    "InReview",
    "Approved",
    "Processing",
    "Completed",
    "Rejected",
    "Cancelled",
  ];
  const types = ["", "Export", "Erasure", "Rectification", "Restriction"];
  const overdue = dsrs.filter((d) => d.isOverdue).length;

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
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("compliance.dsrTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} {t("compliance.total")} · {overdue} {t("compliance.overdue")}
            </p>
          </div>
        </div>
        <Button id="compliance-dsr-refresh" variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <FilterToggle
                key={s || "all-status"}
                label={s || t("common.all") || "All"}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <FilterToggle
                key={type || "all-types"}
                label={type || t("compliance.allTypes") || "All Types"}
                active={typeFilter === type}
                onClick={() => setTypeFilter(type)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("compliance.dsrTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : dsrs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t("compliance.noDsrs")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("compliance.subject")}</TableHead>
                  <TableHead>{t("compliance.requestType")}</TableHead>
                  <TableHead>{t("compliance.status")}</TableHead>
                  <TableHead>{t("compliance.sla")}</TableHead>
                  <TableHead>{t("compliance.deadline")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dsrs.map((dsr: DataSubjectRequest) => (
                  <TableRow key={dsr.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{dsr.subjectEmail}</p>
                        <p className="text-xs text-muted-foreground">{dsr.regulationCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{dsr.requestType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[dsr.status] ?? "outline"}>{dsr.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <SlaBar percent={dsr.slaPercent} color={dsr.slaColor} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {dsr.isOverdue && (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        {dsr.isCompleted && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {dsr.daysRemaining > 0
                            ? `${dsr.daysRemaining}d ${t("compliance.remaining")}`
                            : dsr.isCompleted
                              ? t("compliance.completed")
                              : t("compliance.overdue")}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
