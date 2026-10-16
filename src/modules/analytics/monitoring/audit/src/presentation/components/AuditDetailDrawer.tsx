// FILE-EXCEPTION: rule bypass for existing large file
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
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      ) : data ? (
        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
          {/* 1. Pinned Header */}
          <DetailSheetHeader className="bg-card">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="px-2 py-0.5 font-mono text-xs font-bold">
                {data.eventType}
              </Badge>

              <Badge
                variant={data.isSuccess ? "outline" : "destructive"}
                className={`gap-1 text-[11px] font-semibold ${
                  data.isSuccess
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
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
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  severity === "critical"
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
                    : severity === "warning"
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                      : "border-blue-500/50 bg-blue-500/10 text-blue-500"
                }`}
              >
                {severity}
              </Badge>

              <span className="ms-auto flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTimeUtc(data.timestamp)}
              </span>
            </div>

            {/* Human-readable Headline */}
            <h2 className="mt-3 text-base font-bold leading-snug text-foreground sm:text-lg">
              <span className="font-mono text-primary">{data.username ?? "System"}</span>{" "}
              <span className="font-normal text-muted-foreground">executed</span>{" "}
              <span className="font-semibold text-foreground">{data.eventType}</span>
              {data.entityType && (
                <>
                  {" "}
                  <span className="font-normal text-muted-foreground">on</span>{" "}
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
                <div className="flex min-w-0 items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider">
                    Trace:
                  </span>
                  <span className="select-all truncate font-mono text-foreground">
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
          <DetailSheetTabBar className="border-b border-border/80 bg-card/90">
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
                  className="ms-1 h-4 px-1 font-mono text-[9px] tabular-nums"
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
          <DetailSheetBody className="space-y-6 p-6">
            {/* ──────── TAB 1: OVERVIEW ──────── */}
            <TabsContent value="overview" className="focus-visible:outline-hidden mt-0 space-y-5">
              {/* Error Banner if failed */}
              {!data.isSuccess && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-500">
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider">
                        {t("audit.detail.executionFailure") || "Operation Failed"}
                        {data.statusCode ? ` (HTTP ${data.statusCode})` : ""}
                      </p>
                      <p className="break-all font-mono text-sm text-foreground">
                        {data.errorMessage || "Unknown error during operation execution."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of Key Info Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Card A: Actor Context */}
                <Card className="shadow-2xs border-border/80 bg-card/80">
                  <CardContent className="space-y-3 p-4">
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
                              className="border border-primary/20 bg-primary/10 px-1 py-0 text-[9px] text-primary"
                            >
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>

                      {data.userId && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">User ID:</span>
                          <span
                            className="max-w-[180px] select-all truncate font-mono text-[11px] text-foreground"
                            title={data.userId}
                          >
                            {data.userId}
                          </span>
                        </div>
                      )}

                      {data.tenantId && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Tenant ID:</span>
                          <span
                            className="max-w-[180px] select-all truncate font-mono text-[11px] text-foreground"
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
                <Card className="shadow-2xs border-border/80 bg-card/80">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("audit.detail.targetResource") || "Target Resource"}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Entity Type:</span>
                        <span className="font-mono font-semibold text-foreground">
                          {data.entityType ?? "None"}
                        </span>
                      </div>

                      {data.entityId && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Entity ID:</span>
                          <span className="select-all font-mono text-[11px] text-foreground">
                            {data.entityId}
                          </span>
                        </div>
                      )}

                      {data.endpoint && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Endpoint:</span>
                          <span className="max-w-[200px] truncate font-mono text-[11px] text-foreground">
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
                <Card className="shadow-2xs border-border/80 bg-card/80 md:col-span-2">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("audit.detail.originTelemetry") || "Network & Origin Telemetry"}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Client IP Address:</span>
                        <div className="flex items-center gap-2 font-mono text-foreground">
                          <span>{data.ipAddress ?? "—"}</span>
                          {data.ipAddress && (
                            /* UI-EXCEPTION */ <button
                              type="button"
                              className="cursor-pointer text-muted-foreground hover:text-foreground"
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
                        <p className="break-all font-mono text-[11px] text-foreground">
                          {data.userAgent ?? "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ──────── TAB 2: CHANGES & DIFF ──────── */}
            <TabsContent value="changes" className="focus-visible:outline-hidden mt-0 space-y-4">
              {changedFieldsList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/60 bg-accent/30 p-3">
                  <span className="me-1 text-xs font-semibold text-muted-foreground">
                    {t("audit.detail.changedFields") || "Modified Fields"}:
                  </span>
                  {changedFieldsList.map((f) => (
                    <Badge key={f} variant="outline" className="bg-card font-mono text-[11px]">
                      {f}
                    </Badge>
                  ))}
                </div>
              )}

              {parsedDiff && parsedDiff.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/50">
                      <tr>
                        <th className="w-1/4 px-3 py-2 font-semibold text-muted-foreground">
                          Field
                        </th>
                        <th className="w-3/8 px-3 py-2 font-semibold text-muted-foreground">
                          Previous Value
                        </th>
                        <th className="w-3/8 px-3 py-2 font-semibold text-muted-foreground">
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
                          <td className="px-3 py-2 font-semibold text-foreground">
                            <div className="flex items-center gap-1.5">
                              <span>{row.key}</span>
                              {row.status === "added" && (
                                <Badge className="bg-emerald-500/20 px-1 py-0 text-[9px] text-emerald-500">
                                  +new
                                </Badge>
                              )}
                              {row.status === "removed" && (
                                <Badge className="bg-rose-500/20 px-1 py-0 text-[9px] text-rose-500">
                                  -deleted
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="select-all break-all px-3 py-2 text-muted-foreground">
                            {row.oldVal ?? (
                              <span className="italic text-muted-foreground/40">null</span>
                            )}
                          </td>
                          <td className="select-all break-all px-3 py-2 font-semibold text-foreground">
                            {row.newVal ?? (
                              <span className="italic text-muted-foreground/40">null</span>
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
            <TabsContent value="raw" className="focus-visible:outline-hidden mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Raw Audit Record
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 cursor-pointer gap-1.5 px-2.5 text-xs"
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

              <pre className="select-all overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
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
                className="me-auto cursor-pointer gap-1.5 text-xs"
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
                className="cursor-pointer gap-1.5 text-xs"
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
              className="cursor-pointer text-xs"
            >
              Close
            </Button>
          </DetailSheetFooter>
        </Tabs>
      ) : null}
    </DetailSheet>
  );
}
