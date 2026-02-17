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
import { format } from "date-fns";

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

      const toggleExpand = (id: string) =>
            setExpandedId((prev) => (prev === id ? null : id));

      return (
            <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base">
                              {t("webhooks.deliveryLog") || "Delivery Log"}
                              {totalCount > 0 && (
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                          ({totalCount})
                                    </span>
                              )}
                        </CardTitle>

                        {/* Filter pills */}
                        <div className="flex items-center gap-1.5">
                              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                              {(["all", "success", "failed"] as const).map((f) => (
                                    <Button
                                          key={f}
                                          variant={filter === f ? "default" : "ghost"}
                                          size="sm"
                                          className="h-7 text-xs px-2.5"
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
                              <div className="p-6 space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                          <Skeleton key={i} className="h-14 w-full rounded-lg" />
                                    ))}
                              </div>
                        )}

                        {/* Empty state */}
                        {!isLoading && logs.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <div className="p-4 rounded-full bg-muted/50 mb-3">
                                          <Clock className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                          {t("webhooks.noDeliveries") || "No deliveries yet"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                          {t("webhooks.noDeliveriesDesc") ||
                                                "Delivery attempts will appear here when events are triggered."}
                                    </p>
                              </div>
                        )}

                        {/* Table */}
                        {!isLoading && logs.length > 0 && (
                              <div className="overflow-x-auto">
                                    <table className="w-full">
                                          <thead>
                                                <tr className="border-t border-b bg-muted/30">
                                                      <th className="text-xs font-medium text-muted-foreground text-left px-4 py-2.5 w-8" />
                                                      <th className="text-xs font-medium text-muted-foreground text-left px-4 py-2.5">
                                                            {t("webhooks.eventType") || "Event"}
                                                      </th>
                                                      <th className="text-xs font-medium text-muted-foreground text-left px-4 py-2.5">
                                                            {t("webhooks.statusLabel") || "Status"}
                                                      </th>
                                                      <th className="text-xs font-medium text-muted-foreground text-left px-4 py-2.5">
                                                            {t("webhooks.httpCode") || "HTTP"}
                                                      </th>
                                                      <th className="text-xs font-medium text-muted-foreground text-left px-4 py-2.5">
                                                            {t("webhooks.attempt") || "Attempt"}
                                                      </th>
                                                      <th className="text-xs font-medium text-muted-foreground text-left px-4 py-2.5">
                                                            {t("webhooks.latency") || "Latency"}
                                                      </th>
                                                      <th className="text-xs font-medium text-muted-foreground text-left px-4 py-2.5">
                                                            {t("webhooks.timestamp") || "Timestamp"}
                                                      </th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {logs.map((log) => (
                                                      <Fragment key={log.id}>
                                                            <tr
                                                                  className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                                                                  onClick={() => toggleExpand(log.id)}
                                                            >
                                                                  <td className="px-4 py-3">
                                                                        {expandedId === log.id ? (
                                                                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                                        ) : (
                                                                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                                        )}
                                                                  </td>
                                                                  <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-1.5">
                                                                              <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                                                                              <span className="text-sm font-mono">
                                                                                    {log.eventType}
                                                                              </span>
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-4 py-3">
                                                                        {log.isSuccess ? (
                                                                              <Badge
                                                                                    variant="outline"
                                                                                    className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 gap-1 text-xs"
                                                                              >
                                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                                    {t("webhooks.status.success") || "Success"}
                                                                              </Badge>
                                                                        ) : (
                                                                              <Badge
                                                                                    variant="outline"
                                                                                    className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 gap-1 text-xs"
                                                                              >
                                                                                    <XCircle className="h-3 w-3" />
                                                                                    {t("webhooks.status.failed") || "Failed"}
                                                                              </Badge>
                                                                        )}
                                                                  </td>
                                                                  <td className="px-4 py-3">
                                                                        <Badge
                                                                              variant="outline"
                                                                              className={`text-xs font-mono ${log.httpStatusCode >= 200 &&
                                                                                          log.httpStatusCode < 300
                                                                                          ? "text-emerald-700 dark:text-emerald-400"
                                                                                          : log.httpStatusCode >= 400
                                                                                                ? "text-red-700 dark:text-red-400"
                                                                                                : "text-amber-700 dark:text-amber-400"
                                                                                    }`}
                                                                        >
                                                                              {log.httpStatusCode}
                                                                        </Badge>
                                                                  </td>
                                                                  <td className="px-4 py-3 text-sm text-muted-foreground">
                                                                        {log.attemptNumber}
                                                                  </td>
                                                                  <td className="px-4 py-3">
                                                                        <span
                                                                              className={`text-sm font-medium ${log.latencyMs < 500
                                                                                          ? "text-emerald-600 dark:text-emerald-400"
                                                                                          : log.latencyMs < 2000
                                                                                                ? "text-amber-600 dark:text-amber-400"
                                                                                                : "text-red-600 dark:text-red-400"
                                                                                    }`}
                                                                        >
                                                                              {log.latencyMs.toFixed(0)}ms
                                                                        </span>
                                                                  </td>
                                                                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                                                                        {format(
                                                                              new Date(log.createdAt),
                                                                              "MMM d, HH:mm:ss"
                                                                        )}
                                                                  </td>
                                                            </tr>

                                                            {/* Expanded details */}
                                                            {expandedId === log.id && (
                                                                  <tr className="bg-muted/10">
                                                                        <td colSpan={7} className="px-6 py-4">
                                                                              <div className="space-y-3 text-sm">
                                                                                    {/* Error message */}
                                                                                    {log.errorMessage && (
                                                                                          <div>
                                                                                                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                                                                                                      {t("webhooks.errorMessage") || "Error"}
                                                                                                </p>
                                                                                                <pre className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs overflow-x-auto">
                                                                                                      {log.errorMessage}
                                                                                                </pre>
                                                                                          </div>
                                                                                    )}

                                                                                    {/* Request URL */}
                                                                                    <div>
                                                                                          <p className="text-xs font-medium text-muted-foreground mb-1">
                                                                                                {t("webhooks.requestUrl") || "Request URL"}
                                                                                          </p>
                                                                                          <code className="text-xs bg-muted px-2 py-1 rounded">
                                                                                                {log.requestUrl}
                                                                                          </code>
                                                                                    </div>

                                                                                    {/* Payload */}
                                                                                    {log.payloadJson && (
                                                                                          <div>
                                                                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                                                                      {t("webhooks.payload") || "Payload"}
                                                                                                </p>
                                                                                                <pre className="bg-muted/50 border rounded-lg p-3 text-xs overflow-x-auto max-h-48">
                                                                                                      {(() => {
                                                                                                            try {
                                                                                                                  return JSON.stringify(
                                                                                                                        JSON.parse(log.payloadJson),
                                                                                                                        null,
                                                                                                                        2
                                                                                                                  );
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
                                                                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                                                                      {t("webhooks.responseBody") || "Response Body"}
                                                                                                </p>
                                                                                                <pre className="bg-muted/50 border rounded-lg p-3 text-xs overflow-x-auto max-h-32">
                                                                                                      {log.responseBody}
                                                                                                </pre>
                                                                                          </div>
                                                                                    )}
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            )}
                                                      </Fragment>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                              <div className="flex items-center justify-between px-4 py-3 border-t">
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
