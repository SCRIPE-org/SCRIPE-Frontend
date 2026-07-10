// FILE-EXCEPTION: file length
/**
 * DeliveryLogTable
 *
 * Paginated table for webhook delivery attempt history.
 * Shows event type, status, HTTP code, latency, timestamp, and expandable payload.
 */
"use client";

import { useState, Fragment } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import type { WebhookDeliveryLog } from "../../domain/entities/Webhook";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatUtc } from "@core/common/utils";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";

interface DeliveryLogTableProps {
  logs: WebhookDeliveryLog[];
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  filter: "all" | "success" | "failed";
  onFilterChange: (filter: "all" | "success" | "failed") => void;
  isLoading: boolean;
}

/**
 * Presentation UI component rendering the delivery log table.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DeliveryLogTable({
  logs,
  page,
  pageSize,
  totalCount,
  onPageChange,
  filter,
  onFilterChange,
  isLoading,
}: DeliveryLogTableProps) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">
          {t("webhooks.deliveryLog") || "Delivery Log"}
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({totalCount})</span>
          )}
        </CardTitle>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          <Filter className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          {(["all", "success", "failed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => {
                onFilterChange(f);
                onPageChange(1); // Reset to page 1 on filter change
              }}
            >
              {f === "all"
                ? t("common.all") || "All"
                : f === "success"
                  ? t("webhooks.status.success") || "Success"
                  : t("webhooks.status.failed") || "Failed"}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 rounded-full bg-muted/50 p-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("webhooks.noDeliveries") || "No deliveries yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("webhooks.noDeliveriesDesc") ||
                "Delivery attempts will appear here when events are triggered."}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && logs.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-8" />
                  <TableHead>{t("webhooks.eventType") || "Event"}</TableHead>
                  <TableHead>{t("webhooks.statusLabel") || "Status"}</TableHead>
                  <TableHead>{t("webhooks.httpCode") || "HTTP"}</TableHead>
                  <TableHead>{t("webhooks.attempt") || "Attempt"}</TableHead>
                  <TableHead>{t("webhooks.latency") || "Latency"}</TableHead>
                  <TableHead>{t("webhooks.timestamp") || "Timestamp"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleExpand(log.id)}
                    >
                      <TableCell>
                        {expandedId === log.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3 w-3 shrink-0 text-amber-500" />
                          <span className="text-sm font-medium">
                            {(t(`webhooks.eventNames.${log.eventType}`) || log.eventType) as string}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.eventType}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.status ? (
                          <DeliveryStatusBadge status={log.status} />
                        ) : log.isSuccess ? (
                          <Badge
                            variant="outline"
                            className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {t("webhooks.status.success") || "Success"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 border-red-200 bg-red-50 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                          >
                            <XCircle className="h-3 w-3" />
                            {t("webhooks.status.failed") || "Failed"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            log.httpStatusCode >= 200 && log.httpStatusCode < 300
                              ? "text-emerald-700 dark:text-emerald-400"
                              : log.httpStatusCode >= 400
                                ? "text-red-700 dark:text-red-400"
                                : "text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {log.httpStatusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="text-sm">
                          {log.attemptNumber}
                          {log.maxAttempts ? `/${log.maxAttempts}` : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            log.latencyMs < 500
                              ? "text-emerald-600 dark:text-emerald-400"
                              : log.latencyMs < 2000
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {log.latencyMs.toFixed(0)}ms
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatUtc(log.createdAt, "MMM d, HH:mm:ss")}
                      </TableCell>
                    </TableRow>

                    {/* Expanded details */}
                    {expandedId === log.id && (
                      <TableRow className="bg-muted/10 hover:bg-muted/10">
                        <TableCell colSpan={7} className="p-0">
                          <div className="space-y-3 border-t p-6">
                            {/* Delivery metadata */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              {log.eventDeliveryId && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Delivery ID:</span>
                                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                    {log.eventDeliveryId}
                                  </code>
                                </div>
                              )}
                              {log.nextRetryAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Next retry:{" "}
                                    {formatUtc(log.nextRetryAt, "MMM d, HH:mm:ss")}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Error message */}
                            {log.errorMessage && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-red-600 dark:text-red-400">
                                  {t("webhooks.errorMessage") || "Error"}
                                </p>
                                <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-all rounded-lg border border-red-200 bg-red-50 p-3 text-xs dark:border-red-800 dark:bg-red-950/20">
                                  {log.errorMessage}
                                </pre>
                              </div>
                            )}

                            {/* Request URL */}
                            <div>
                              <p className="mb-1 text-xs font-medium text-muted-foreground">
                                {t("webhooks.requestUrl") || "Request URL"}
                              </p>
                              <code className="rounded bg-muted px-2 py-1 text-xs">
                                {log.requestUrl}
                              </code>
                            </div>

                            {/* Payload */}
                            {log.payloadJson && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground">
                                  {t("webhooks.payload") || "Payload"}
                                </p>
                                <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-all rounded-lg border bg-muted/50 p-3 text-xs">
                                  {(() => {
                                    try {
                                      return JSON.stringify(JSON.parse(log.payloadJson), null, 2);
                                    } catch {
                                      return log.payloadJson;
                                    }
                                  })()}
                                </pre>
                              </div>
                            )}

                            {/* Response body */}
                            {log.responseBody && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground">
                                  {t("webhooks.responseBody") || "Response Body"}
                                </p>
                                <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-all rounded-lg border bg-muted/50 p-3 text-xs">
                                  {log.responseBody}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {t("common.page") || "Page"} {page} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
