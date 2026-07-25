// FILE-EXCEPTION: file length
/**
 * DeliveryLogTable
 *
 * Paginated table for webhook delivery attempt history.
 * Shows event type, status, HTTP code, latency, timestamp, and expandable payload.
 */
"use client";

import { useCallback, useState, Fragment } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import type { WebhookDeliveryLog } from "../../domain/entities/Webhook";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock, Zap, Filter } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@core/ui/pagination";
import { formatUtc, cn } from "@core/common/utils";
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

  // The row itself stays keyboard-activatable (Enter/Space expand the same
  // detail a pointer click does) — TableRow's `clickable` prop wires the
  // pointer cursor and focus ring but never invents key handling on its own.
  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleExpand(id);
      }
    },
    []
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">
          {t("webhooks.deliveryLog")}
          {totalCount > 0 && (
            <span className="ms-2 text-sm font-normal text-nx-ink-2">({totalCount})</span>
          )}
        </CardTitle>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5">
          <Filter className="me-1 h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
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
                ? t("common.all")
                : f === "success"
                  ? t("webhooks.status.success")
                  : t("webhooks.status.failed")}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-nx-md" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && logs.length === 0 && (
          <EmptyState
            bare
            icon={Clock}
            title={t("webhooks.noDeliveries")}
            description={t("webhooks.noDeliveriesDesc")}
          />
        )}

        {/* Table */}
        {!isLoading && logs.length > 0 && (
          <div className="rounded-nx-lg border border-nx-line">
            <Table>
              <TableHeader>
                <TableRow className="bg-nx-raised hover:bg-nx-raised">
                  <TableHead className="w-8" />
                  <TableHead>{t("webhooks.eventType")}</TableHead>
                  <TableHead>{t("webhooks.statusLabel")}</TableHead>
                  <TableHead variant="numeric">{t("webhooks.httpCode")}</TableHead>
                  <TableHead variant="numeric">{t("webhooks.attempt")}</TableHead>
                  <TableHead variant="numeric">{t("webhooks.latency")}</TableHead>
                  <TableHead>{t("webhooks.timestamp")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <TableRow
                      clickable
                      role="button"
                      aria-expanded={expandedId === log.id}
                      onClick={() => toggleExpand(log.id)}
                      onKeyDown={(e) => handleRowKeyDown(e, log.id)}
                    >
                      <TableCell>
                        {expandedId === log.id ? (
                          <ChevronUp className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3 w-3 shrink-0 text-warning" aria-hidden="true" />
                          <span className="text-sm font-medium">
                            {(t(`webhooks.eventNames.${log.eventType}`) || log.eventType) as string}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-nx-ink-3">{log.eventType}</span>
                      </TableCell>
                      <TableCell>
                        {log.status ? (
                          <DeliveryStatusBadge status={log.status} />
                        ) : log.isSuccess ? (
                          <Badge variant="success" className="gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            {t("webhooks.status.success")}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <XCircle className="h-3 w-3" aria-hidden="true" />
                            {t("webhooks.status.failed")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell variant="numeric">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            log.httpStatusCode >= 200 && log.httpStatusCode < 300
                              ? "text-success"
                              : log.httpStatusCode >= 400
                                ? "text-destructive"
                                : "text-warning"
                          }`}
                        >
                          {log.httpStatusCode}
                        </Badge>
                      </TableCell>
                      <TableCell variant="numeric" className="text-nx-ink-2">
                        {log.attemptNumber}
                        {log.maxAttempts ? `/${log.maxAttempts}` : ""}
                      </TableCell>
                      <TableCell variant="numeric">
                        <span
                          className={`font-medium ${
                            log.latencyMs < 500
                              ? "text-success"
                              : log.latencyMs < 2000
                                ? "text-warning"
                                : "text-destructive"
                          }`}
                        >
                          {log.latencyMs.toFixed(0)}ms
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-nx-ink-2">
                        {formatUtc(log.createdAt, "MMM d, HH:mm:ss")}
                      </TableCell>
                    </TableRow>

                    {/* Expanded details */}
                    {expandedId === log.id && (
                      <TableRow className="bg-nx-hover hover:bg-nx-hover">
                        <TableCell colSpan={7} className="p-0">
                          <div className="space-y-3 border-t border-nx-line p-6">
                            {/* Delivery metadata */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-nx-ink-3">
                              {log.eventDeliveryId && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{t("webhooks.deliveryId")}:</span>
                                  <code className="rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-[10px]">
                                    {log.eventDeliveryId}
                                  </code>
                                </div>
                              )}
                              {log.nextRetryAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  <span>
                                    {t("webhooks.nextRetry")}:{" "}
                                    {formatUtc(log.nextRetryAt, "MMM d, HH:mm:ss")}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Error message */}
                            {log.errorMessage && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-destructive">
                                  {t("webhooks.errorMessage")}
                                </p>
                                <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-all rounded-nx-md border border-destructive/30 bg-destructive/10 p-3 text-xs">
                                  {log.errorMessage}
                                </pre>
                              </div>
                            )}

                            {/* Request URL */}
                            <div>
                              <p className="mb-1 text-xs font-medium text-nx-ink-3">
                                {t("webhooks.requestUrl")}
                              </p>
                              <code className="rounded-nx-sm bg-nx-raised px-2 py-1 text-xs">
                                {log.requestUrl}
                              </code>
                            </div>

                            {/* Payload */}
                            {log.payloadJson && (
                              <div>
                                <p className="mb-1 text-xs font-medium text-nx-ink-3">
                                  {t("webhooks.payload")}
                                </p>
                                <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-all rounded-nx-md border border-nx-line bg-nx-raised p-3 text-xs">
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
                                <p className="mb-1 text-xs font-medium text-nx-ink-3">
                                  {t("webhooks.responseBody")}
                                </p>
                                <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-all rounded-nx-md border border-nx-line bg-nx-raised p-3 text-xs">
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

        {/* Pagination — composed from the core pagination primitives, which
            already flip their chevrons for RTL */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-nx-line px-4 py-3">
            <p className="text-xs tabular-nums text-nx-ink-3">
              {t("common.page")} {page} / {totalPages}
            </p>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={page <= 1 || undefined}
                    tabIndex={page <= 1 ? -1 : undefined}
                    className={cn("h-8", page <= 1 && "pointer-events-none opacity-50")}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page - 1);
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={page >= totalPages || undefined}
                    tabIndex={page >= totalPages ? -1 : undefined}
                    className={cn("h-8", page >= totalPages && "pointer-events-none opacity-50")}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
