// FILE-EXCEPTION: file length
/**
 * DeadLetterQueue
 *
 * Management view for dead-lettered webhook deliveries.
 * Shows failed deliveries with replay (single + bulk) actions.
 */
"use client";

import { useState, Fragment } from "react";
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
import {
  Skull,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Zap,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { format } from "date-fns";

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

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Skull className="h-4 w-4 text-red-500" />
            {t("webhooks.deadLetters.title") || "Dead Letter Queue"}
            {totalCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                {totalCount}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="mt-1">
            {t("webhooks.deadLetters.description") ||
              "Deliveries that exhausted all retry attempts. Replay to re-attempt delivery."}
          </CardDescription>
        </div>

        {/* Replay All Button */}
        {totalCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
            onClick={() => setReplayAllDialogOpen(true)}
            disabled={isReplayingAll}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {isReplayingAll
              ? t("webhooks.deadLetters.replaying") || "Replaying..."
              : t("webhooks.deadLetters.replayAll") || "Replay All"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 rounded-full bg-emerald-50 p-4 dark:bg-emerald-950/30">
              <Inbox className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {t("webhooks.deadLetters.empty") || "No dead letters"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("webhooks.deadLetters.emptyDesc") ||
                "All deliveries are being processed successfully."}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && logs.length > 0 && (
          <>
            <div className="mx-4 mb-4 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50/50 hover:bg-red-50/50 dark:bg-red-950/10 dark:hover:bg-red-950/10">
                    <TableHead className="w-8" />
                    <TableHead>{t("webhooks.eventType") || "Event"}</TableHead>
                    <TableHead>{t("webhooks.httpCode") || "HTTP"}</TableHead>
                    <TableHead>{t("webhooks.attempt") || "Attempts"}</TableHead>
                    <TableHead>{t("webhooks.errorMessage") || "Error"}</TableHead>
                    <TableHead>{t("webhooks.timestamp") || "Failed At"}</TableHead>
                    <TableHead className="w-[100px] text-center">
                      {t("common.actions") || "Actions"}
                    </TableHead>
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
                              {
                                (t(`webhooks.eventNames.${log.eventType}`) ||
                                  log.eventType) as string
                              }
                            </span>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.eventType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-red-200 bg-red-50 font-mono text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                          >
                            {log.httpStatusCode || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {log.attemptNumber}/{log.maxAttempts}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-[200px] truncate text-sm text-red-600 dark:text-red-400">
                            {log.errorMessage || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.createdAt), "MMM d, HH:mm")}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReplay(log.id);
                            }}
                            disabled={isReplaying}
                          >
                            <RotateCcw className="h-3 w-3" />
                            {t("webhooks.deadLetters.replay") || "Replay"}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row: payload + response details */}
                      {expandedId === log.id && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={7} className="p-0">
                            <div className="space-y-3 p-4">
                              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                {/* Payload */}
                                <div>
                                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                    {t("webhooks.payload") || "Payload"}
                                  </p>
                                  <pre className="max-h-[200px] overflow-x-auto overflow-y-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">
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
                                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                    {t("webhooks.responseOrError") || "Response / Error"}
                                  </p>
                                  <pre className="max-h-[200px] overflow-x-auto overflow-y-auto rounded-lg bg-zinc-950 p-3 text-xs text-red-400">
                                    {log.errorMessage || log.responseBody || "No response captured"}
                                  </pre>
                                </div>
                              </div>

                              {/* Correlation ID */}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium">Delivery ID:</span>
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 pb-4">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages} · {totalCount} total
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {t("webhooks.deadLetters.replayAllTitle") || "Replay All Dead Letters"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(
                t("webhooks.deadLetters.replayAllDesc") ||
                "This will re-queue all {count} dead-lettered deliveries for retry. The deliveries will be processed by the background retry job."
              ).replace("{count}", String(totalCount))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                onReplayAll();
                setReplayAllDialogOpen(false);
              }}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              {t("webhooks.deadLetters.confirmReplayAll") || "Replay All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
