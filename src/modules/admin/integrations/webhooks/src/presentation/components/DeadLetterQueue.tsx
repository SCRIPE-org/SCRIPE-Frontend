// FILE-EXCEPTION: file length
/**
 * DeadLetterQueue
 *
 * Management view for dead-lettered webhook deliveries.
 * Shows failed deliveries with replay (single + bulk) actions.
 */
"use client";

import { useCallback, useState, Fragment } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";
import type { WebhookDeliveryLog } from "../../domain/entities/Webhook";
import { Skull, RotateCcw, ChevronDown, ChevronUp, Zap, AlertTriangle, Inbox } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@core/ui/pagination";
import { formatUtc, cn } from "@core/common/utils";
import { EmptyState } from "@core/ui/empty-state";

interface DeadLetterQueueProps {
  logs: WebhookDeliveryLog[];
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onReplay: (logId: string) => void;
  onReplayAll: () => void;
  isReplaying: boolean;
  isReplayingAll: boolean;
  isLoading: boolean;
}

/**
 * Presentation UI component rendering the dead letter queue.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DeadLetterQueue({
  logs,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onReplay,
  onReplayAll,
  isReplaying,
  isReplayingAll,
  isLoading,
}: DeadLetterQueueProps) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replayAllDialogOpen, setReplayAllDialogOpen] = useState(false);
  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  // Mirrors DeliveryLogTable's row: TableRow's `clickable` prop wires the
  // pointer/focus affordance but never invents key handling on its own.
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
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Skull className="h-4 w-4 text-destructive" aria-hidden="true" />
            {t("webhooks.deadLetters.title")}
            {totalCount > 0 && (
              <Badge variant="destructive" className="ms-1 h-5 min-w-[20px] px-1.5 text-xs">
                {totalCount}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="mt-1">{t("webhooks.deadLetters.description")}</CardDescription>
        </div>

        {/* Replay All Button */}
        {totalCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-warning/40 text-warning hover:bg-warning/10"
            onClick={() => setReplayAllDialogOpen(true)}
            disabled={isReplayingAll}
            loading={isReplayingAll}
          >
            {!isReplayingAll && <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
            {isReplayingAll ? t("webhooks.deadLetters.replaying") : t("webhooks.deadLetters.replayAll")}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-nx-md" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && logs.length === 0 && (
          <EmptyState
            bare
            icon={Inbox}
            title={t("webhooks.deadLetters.empty")}
            description={t("webhooks.deadLetters.emptyDesc")}
          />
        )}

        {/* Table */}
        {!isLoading && logs.length > 0 && (
          <>
            <div className="mx-4 mb-4 rounded-nx-lg border border-nx-line">
              <Table>
                <TableHeader>
                  <TableRow className="bg-destructive/5 hover:bg-destructive/5">
                    <TableHead className="w-8" />
                    <TableHead>{t("webhooks.eventType")}</TableHead>
                    <TableHead variant="numeric">{t("webhooks.httpCode")}</TableHead>
                    <TableHead variant="numeric">{t("webhooks.attempt")}</TableHead>
                    <TableHead>{t("webhooks.errorMessage")}</TableHead>
                    <TableHead>{t("webhooks.timestamp")}</TableHead>
                    <TableHead className="w-[100px] text-center">{t("common.actions")}</TableHead>
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
                              {
                                (t(`webhooks.eventNames.${log.eventType}`) ||
                                  log.eventType) as string
                              }
                            </span>
                          </div>
                          <span className="font-mono text-xs text-nx-ink-3">{log.eventType}</span>
                        </TableCell>
                        <TableCell variant="numeric">
                          <Badge
                            variant="outline"
                            className="border-destructive/30 bg-destructive/10 font-mono text-xs text-destructive"
                          >
                            {log.httpStatusCode || t("webhooks.notAvailable")}
                          </Badge>
                        </TableCell>
                        <TableCell variant="numeric" className="text-nx-ink-2">
                          {log.attemptNumber}/{log.maxAttempts}
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-[200px] truncate text-sm text-destructive">
                            {log.errorMessage || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-nx-ink-3">
                            {formatUtc(log.createdAt, "MMM d, HH:mm")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs text-warning hover:bg-warning/10 hover:text-warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReplay(log.id);
                            }}
                            disabled={isReplaying}
                          >
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                            {t("webhooks.deadLetters.replay")}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row: payload + response details */}
                      {expandedId === log.id && (
                        <TableRow className="bg-nx-raised hover:bg-nx-raised">
                          <TableCell colSpan={7} className="p-0">
                            <div className="space-y-3 p-4">
                              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                {/* Payload */}
                                <div>
                                  <p className="mb-1.5 text-xs font-medium text-nx-ink-3">
                                    {t("webhooks.payload")}
                                  </p>
                                  <pre className="max-h-[200px] overflow-x-auto overflow-y-auto rounded-nx-md bg-nx-raised p-3 text-xs text-nx-ink">
                                    {(() => {
                                      try {
                                        return JSON.stringify(JSON.parse(log.payloadJson), null, 2);
                                      } catch {
                                        return log.payloadJson;
                                      }
                                    })()}
                                  </pre>
                                </div>

                                {/* Response / Error */}
                                <div>
                                  <p className="mb-1.5 text-xs font-medium text-nx-ink-3">
                                    {t("webhooks.responseOrError")}
                                  </p>
                                  <pre className="max-h-[200px] overflow-x-auto overflow-y-auto rounded-nx-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                                    {log.errorMessage ||
                                      log.responseBody ||
                                      t("webhooks.deadLetters.noResponseCaptured")}
                                  </pre>
                                </div>
                              </div>

                              {/* Correlation ID */}
                              <div className="flex items-center gap-2 text-xs text-nx-ink-3">
                                <span className="font-medium">{t("webhooks.deliveryId")}:</span>
                                <code className="rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-[10px]">
                                  {log.eventDeliveryId}
                                </code>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination — composed from the core pagination primitives, which
                already flip their chevrons for RTL */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 pb-4">
                <p className="text-xs tabular-nums text-nx-ink-3">
                  {t("webhooks.deadLetters.pageOfTotal", { page, totalPages, totalCount })}
                </p>
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={page <= 1 || undefined}
                        tabIndex={page <= 1 ? -1 : undefined}
                        className={cn("h-7", page <= 1 && "pointer-events-none opacity-50")}
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
                        className={cn("h-7", page >= totalPages && "pointer-events-none opacity-50")}
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
          </>
        )}
      </CardContent>

      {/* Replay All Confirmation */}
      <AlertDialog open={replayAllDialogOpen} onOpenChange={setReplayAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
              {t("webhooks.deadLetters.replayAllTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("webhooks.deadLetters.replayAllDesc", { count: totalCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={() => {
                onReplayAll();
                setReplayAllDialogOpen(false);
              }}
            >
              <RotateCcw className="me-1.5 h-4 w-4" aria-hidden="true" />
              {t("webhooks.deadLetters.confirmReplayAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
