"use client";

import React, { useState, useMemo } from "react";
import {
  AlertOctagon,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Eye,
  FileDiff,
  Globe,
  Hash,
  Layers,
  User,
  XCircle,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import {
  DetailSheet,
  DetailSheetHeader,
  DetailSheetTabBar,
  DetailSheetBody,
  DetailSheetFooter,
} from "@core/ui/detail-sheet";
import { Tabs, TabsContent, TabsTrigger } from "@core/ui/tabs";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Card, CardContent } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import type { AuditLogDetail } from "../../domain/entities/AuditEntities";

interface AuditDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  data?: AuditLogDetail;
  isLoading: boolean;
  onQuickFilterByUser?: (username: string) => void;
  onQuickFilterByCorrelationId?: (correlationId: string) => void;
}

/**
 * AuditDetailDrawer
 */
export function AuditDetailDrawer({
  open,
  onClose,
  data,
  isLoading,
  onQuickFilterByUser,
  onQuickFilterByCorrelationId,
}: AuditDetailDrawerProps) {
  const { t } = useI18n();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Severity calculation
  const severity = useMemo(() => {
    if (!data) return "info";
    if (!data.isSuccess) {
      if (
        (data.statusCode && data.statusCode >= 500) ||
        data.eventType.includes("Denied") ||
        data.eventType.includes("Locked") ||
        data.eventType.includes("Delete")
      ) {
        return "critical";
      }
      return "warning";
    }
    if (
      data.eventType.includes("Delete") ||
      data.eventType.includes("Password") ||
      data.eventType.includes("Revoked")
    ) {
      return "warning";
    }
    return "info";
  }, [data]);

  // Parse structured diff for Changes tab
  const { parsedDiff, changedFieldsList } = useMemo(() => {
    if (!data) return { parsedDiff: null, changedFieldsList: [] };

    let oldObj: Record<string, unknown> = {};
    let newObj: Record<string, unknown> = {};

    try {
      if (data.oldValues) oldObj = JSON.parse(data.oldValues);
    } catch {
      oldObj = {};
    }

    try {
      if (data.newValues) newObj = JSON.parse(data.newValues);
    } catch {
      newObj = {};
    }

    const explicitChanged = data.changedProperties
      ? data.changedProperties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

    const rows = allKeys.map((key) => {
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      const isChanged =
        explicitChanged.includes(key) || JSON.stringify(oldVal) !== JSON.stringify(newVal);

      let status: "added" | "removed" | "modified" | "unchanged" = "unchanged";
      if (oldVal === undefined && newVal !== undefined) status = "added";
      else if (oldVal !== undefined && newVal === undefined) status = "removed";
      else if (isChanged) status = "modified";

      return {
        key,
        oldVal: oldVal !== undefined ? JSON.stringify(oldVal) : null,
        newVal: newVal !== undefined ? JSON.stringify(newVal) : null,
        status,
      };
    });

    return {
      parsedDiff: rows.length > 0 ? rows : null,
      changedFieldsList: explicitChanged,
    };
  }, [data]);

  return (
    <DetailSheet
      open={open}
      onOpenChange={(v) => !v && onClose()}
      width="xl"
      side="end"
      title={data?.eventType ?? "Audit Event"}
      description="Audit event forensic investigation details"
    >
      {isLoading ? (
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      ) : data ? (
        <Tabs defaultValue="overview" className="flex flex-col flex-1 min-h-0">
          {/* 1. Pinned Header */}
          <DetailSheetHeader className="bg-card">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 font-bold">
                {data.eventType}
              </Badge>

              <Badge
                variant={data.isSuccess ? "outline" : "destructive"}
                className={`text-[11px] font-semibold gap-1 ${
                  data.isSuccess
                    ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                    : "bg-destructive text-destructive-foreground"
                }`}
              >
                {data.isSuccess ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {data.isSuccess
                  ? t("audit.filters.success") || "Success"
                  : t("audit.filters.failed") || "Failed"}
              </Badge>

              <Badge
                variant="outline"
                className={`text-[10px] uppercase tracking-wider font-bold ${
                  severity === "critical"
                    ? "border-rose-500/50 text-rose-500 bg-rose-500/10"
                    : severity === "warning"
                      ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                      : "border-blue-500/50 text-blue-500 bg-blue-500/10"
                }`}
              >
                {severity}
              </Badge>

              <span className="ms-auto flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTimeUtc(data.timestamp)}
              </span>
            </div>

            {/* Human-readable Headline */}
            <h2 className="mt-3 text-base sm:text-lg font-bold text-foreground leading-snug">
              <span className="text-primary font-mono">{data.username ?? "System"}</span>{" "}
              <span className="text-muted-foreground font-normal">executed</span>{" "}
              <span className="font-semibold text-foreground">{data.eventType}</span>
              {data.entityType && (
                <>
                  {" "}
                  <span className="text-muted-foreground font-normal">on</span>{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {data.entityType}
                    {data.entityId ? ` #${data.entityId.slice(0, 8)}` : ""}
                  </span>
                </>
              )}
            </h2>

            {/* Correlation ID banner */}
            {data.correlationId && (
              <div className="mt-2.5 flex items-center justify-between gap-2 rounded-md border border-border/80 bg-accent/30 px-2.5 py-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Hash className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0">
                    Trace:
                  </span>
                  <span className="font-mono text-foreground truncate select-all">
                    {data.correlationId}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 cursor-pointer"
                  onClick={() => copyToClipboard(data.correlationId!, "corr")}
                  title="Copy Correlation ID"
                >
                  {copiedKey === "corr" ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </DetailSheetHeader>

          {/* 2. Pinned Tab Bar */}
          <DetailSheetTabBar className="bg-card/90 border-b border-border/80">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              <span>{t("audit.detail.tabs.overview") || "Overview"}</span>
            </TabsTrigger>
            <TabsTrigger value="changes" className="gap-1.5 text-xs">
              <FileDiff className="h-3.5 w-3.5" />
              <span>{t("audit.detail.tabs.changes") || "Changes & Diff"}</span>
              {changedFieldsList.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ms-1 h-4 px-1 text-[9px] font-mono tabular-nums"
                >
                  {changedFieldsList.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-1.5 text-xs">
              <Code2 className="h-3.5 w-3.5" />
              <span>{t("audit.detail.tabs.raw") || "Raw Payload"}</span>
            </TabsTrigger>
          </DetailSheetTabBar>

          {/* 3. Scrollable Body */}
          <DetailSheetBody className="p-6 space-y-6">
            {/* ──────── TAB 1: OVERVIEW ──────── */}
            <TabsContent value="overview" className="mt-0 space-y-5 focus-visible:outline-hidden">
              {/* Error Banner if failed */}
              {!data.isSuccess && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-500">
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {t("audit.detail.executionFailure") || "Operation Failed"}
                        {data.statusCode ? ` (HTTP ${data.statusCode})` : ""}
                      </p>
                      <p className="text-sm font-mono text-foreground break-all">
                        {data.errorMessage || "Unknown error during operation execution."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of Key Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card A: Actor Context */}
                <Card className="border-border/80 bg-card/80 shadow-2xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("audit.detail.actorContext") || "Actor / Principal"}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Username:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {data.username ?? "System"}
                          </span>
                          {data.isAdmin && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0 bg-primary/10 text-primary border border-primary/20"
                            >
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>

                      {data.userId && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">User ID:</span>
                          <span
                            className="font-mono text-[11px] text-foreground select-all truncate max-w-[180px]"
                            title={data.userId}
                          >
                            {data.userId}
                          </span>
                        </div>
                      )}

                      {data.tenantId && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Tenant ID:</span>
                          <span
                            className="font-mono text-[11px] text-foreground select-all truncate max-w-[180px]"
                            title={data.tenantId}
                          >
                            {data.tenantId}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Card B: Target & Operation */}
                <Card className="border-border/80 bg-card/80 shadow-2xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("audit.detail.targetResource") || "Target Resource"}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Entity Type:</span>
                        <span className="font-semibold text-foreground font-mono">
                          {data.entityType ?? "None"}
                        </span>
                      </div>

                      {data.entityId && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Entity ID:</span>
                          <span className="font-mono text-[11px] text-foreground select-all">
                            {data.entityId}
                          </span>
                        </div>
                      )}

                      {data.endpoint && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Endpoint:</span>
                          <span className="font-mono text-[11px] text-foreground truncate max-w-[200px]">
                            {data.httpMethod ? `${data.httpMethod} ` : ""}
                            {data.endpoint}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-mono text-foreground">
                          {data.durationMs !== null ? `${data.durationMs}ms` : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card C: Network & Client Origin */}
                <Card className="border-border/80 bg-card/80 shadow-2xs md:col-span-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("audit.detail.originTelemetry") || "Network & Origin Telemetry"}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Client IP Address:</span>
                        <div className="flex items-center gap-2 font-mono text-foreground">
                          <span>{data.ipAddress ?? "—"}</span>
                          {data.ipAddress && (
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() => copyToClipboard(data.ipAddress!, "ip")}
                            >
                              {copiedKey === "ip" ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-muted-foreground">User Agent:</span>
                        <p className="font-mono text-[11px] text-foreground break-all">
                          {data.userAgent ?? "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ──────── TAB 2: CHANGES & DIFF ──────── */}
            <TabsContent value="changes" className="mt-0 space-y-4 focus-visible:outline-hidden">
              {changedFieldsList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-md bg-accent/30 border border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground me-1">
                    {t("audit.detail.changedFields") || "Modified Fields"}:
                  </span>
                  {changedFieldsList.map((f) => (
                    <Badge key={f} variant="outline" className="font-mono text-[11px] bg-card">
                      {f}
                    </Badge>
                  ))}
                </div>
              )}

              {parsedDiff && parsedDiff.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="py-2 px-3 font-semibold text-muted-foreground w-1/4">
                          Field
                        </th>
                        <th className="py-2 px-3 font-semibold text-muted-foreground w-3/8">
                          Previous Value
                        </th>
                        <th className="py-2 px-3 font-semibold text-muted-foreground w-3/8">
                          New Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono">
                      {parsedDiff.map((row) => (
                        <tr
                          key={row.key}
                          className={
                            row.status === "added"
                              ? "bg-emerald-500/5"
                              : row.status === "removed"
                                ? "bg-rose-500/5"
                                : row.status === "modified"
                                  ? "bg-amber-500/5"
                                  : ""
                          }
                        >
                          <td className="py-2 px-3 font-semibold text-foreground">
                            <div className="flex items-center gap-1.5">
                              <span>{row.key}</span>
                              {row.status === "added" && (
                                <Badge className="text-[9px] bg-emerald-500/20 text-emerald-500 px-1 py-0">
                                  +new
                                </Badge>
                              )}
                              {row.status === "removed" && (
                                <Badge className="text-[9px] bg-rose-500/20 text-rose-500 px-1 py-0">
                                  -deleted
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-muted-foreground break-all select-all">
                            {row.oldVal ?? (
                              <span className="text-muted-foreground/40 italic">null</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-foreground font-semibold break-all select-all">
                            {row.newVal ?? (
                              <span className="text-muted-foreground/40 italic">null</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  bare
                  icon={FileDiff}
                  title={t("audit.detail.noMutationsTitle") || "No Direct Field Mutations"}
                  description={
                    t("audit.detail.noMutationsDesc") ||
                    "This audit event recorded a read, query, authentication, or session action with no database entity field updates."
                  }
                />
              )}
            </TabsContent>

            {/* ──────── TAB 3: RAW PAYLOAD ──────── */}
            <TabsContent value="raw" className="mt-0 space-y-3 focus-visible:outline-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Raw Audit Record
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
                  onClick={() => copyToClipboard(JSON.stringify(data, null, 2), "rawJson")}
                >
                  {copiedKey === "rawJson" ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span>{copiedKey === "rawJson" ? "Copied" : "Copy JSON"}</span>
                </Button>
              </div>

              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs text-foreground leading-relaxed select-all">
                {JSON.stringify(data, null, 2)}
              </pre>
            </TabsContent>
          </DetailSheetBody>

          {/* 4. Pinned Footer */}
          <DetailSheetFooter className="bg-card">
            {/* Quick cross-investigation filters */}
            {data.username && onQuickFilterByUser && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 cursor-pointer me-auto"
                onClick={() => onQuickFilterByUser(data.username!)}
              >
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Filter by user ({data.username})</span>
              </Button>
            )}

            {data.correlationId && onQuickFilterByCorrelationId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 cursor-pointer"
                onClick={() => onQuickFilterByCorrelationId(data.correlationId!)}
              >
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span>Trace Correlation ID</span>
              </Button>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>
          </DetailSheetFooter>
        </Tabs>
      ) : null}
    </DetailSheet>
  );
}
