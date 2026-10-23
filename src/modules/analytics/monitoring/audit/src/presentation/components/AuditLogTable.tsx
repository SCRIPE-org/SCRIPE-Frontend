// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import { memo, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { CheckCircle2, Eye, FileText, XCircle } from "lucide-react";
import { cn, formatDateTimeUtc } from "@core/common/utils";
import type { AuditLogPage, AuditLogEntry } from "../../domain/entities/AuditEntities";

interface Props {
  data: AuditLogPage | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onRowClick: (id: string) => void;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
}

function getActionBadgeStyle(eventType: string) {
  if (
    eventType.includes("Create") ||
    eventType.includes("Assigned") ||
    eventType.includes("Granted")
  ) {
    return "border-success/40 text-success bg-success/10";
  }
  if (
    eventType.includes("Delete") ||
    eventType.includes("Revoked") ||
    eventType.includes("Denied")
  ) {
    return "border-destructive/40 text-destructive bg-destructive/10";
  }
  if (
    eventType.includes("Update") ||
    eventType.includes("StatusChanged") ||
    eventType.includes("Transfer")
  ) {
    return "border-info/40 text-info bg-info/10";
  }
  if (eventType.includes("Login") || eventType.includes("Token")) {
    return "border-primary/40 text-primary bg-primary/10";
  }
  if (
    eventType.includes("Password") ||
    eventType.includes("TwoFactor") ||
    eventType.includes("Locked")
  ) {
    return "border-warning/40 text-warning bg-warning/10";
  }
  return "border-nx-line text-nx-ink bg-nx-raised";
}

function getSeverityBadge(log: AuditLogEntry) {
  if (!log.isSuccess) {
    if (
      log.eventType.includes("Denied") ||
      log.eventType.includes("Locked") ||
      log.eventType.includes("Delete")
    ) {
      return (
        <Badge
          variant="outline"
          className="border-destructive/50 bg-destructive/10 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider text-destructive"
        >
          Critical
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-warning/50 bg-warning/10 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider text-warning"
      >
        Warning
      </Badge>
    );
  }
  if (log.eventType.includes("Delete") || log.eventType.includes("Password")) {
    return (
      <Badge
        variant="outline"
        className="border-warning/50 bg-warning/10 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider text-warning"
      >
        Warning
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-nx-line bg-nx-raised px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider text-nx-ink-3"
    >
      Info
    </Badge>
  );
}

/**
 * AuditLogTable
 */
export const AuditLogTable = memo(function AuditLogTable({
  data,
  isLoading,
  error,
  onRetry,
  onRowClick,
  onPageChange,
  pageSize = 20,
  onPageSizeChange,
}: Props) {
  const { t } = useI18n();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRowClick(id);
      }
    },
    [onRowClick]
  );

  if (isLoading) {
    return (
      <div className="space-y-2.5 p-1" role="status" aria-label={t("common.loading")}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} shape="block" className="h-11 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col justify-center">
        <ErrorMessage size="sm" message={t("common.error")} onRetry={onRetry} />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col justify-center">
        <EmptyState
          size="sm"
          bare
          icon={FileText}
          title={t("audit.results.noResults") || "No Audit Records Found"}
          description={
            t("audit.results.noResultsDesc") ||
            "No audit events matched your search filters. Try broadening your criteria or resetting filters."
          }
        />
      </div>
    );
  }

  const startItem = (data.pageNumber - 1) * data.pageSize + 1;
  const endItem = Math.min(data.pageNumber * data.pageSize, data.totalCount);

  return (
    <div aria-live="polite" className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-nx-line bg-nx-surface">
        <Table>
          <TableHeader className="bg-nx-raised/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[145px] text-xs font-semibold text-nx-ink-3">
                {t("audit.table.timestamp") || "Timestamp (UTC)"}
              </TableHead>
              <TableHead className="w-[180px] text-xs font-semibold text-nx-ink-3">
                {t("audit.table.user") || "Actor"}
              </TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-nx-ink-3">
                {t("audit.table.tenant") || "Scope"}
              </TableHead>
              <TableHead className="w-[170px] text-xs font-semibold text-nx-ink-3">
                {t("audit.table.eventType") || "Action"}
              </TableHead>
              <TableHead className="text-xs font-semibold text-nx-ink-3">
                {t("audit.table.entity") || "Resource"}
              </TableHead>
              <TableHead className="hidden text-xs font-semibold text-nx-ink-3 lg:table-cell">
                {t("audit.table.origin") || "Origin / Client"}
              </TableHead>
              <TableHead className="w-[100px] text-center text-xs font-semibold text-nx-ink-3">
                {t("audit.table.status") || "Status"}
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-nx-line">
            {data.items.map((log) => {
              const initials = (log.username ?? "SY").slice(0, 2).toUpperCase();

              return (
                <TableRow
                  key={log.id}
                  clickable
                  role="button"
                  onClick={() => onRowClick(log.id)}
                  onKeyDown={(e) => handleKeyDown(e, log.id)}
                  tabIndex={0}
                  className="group cursor-pointer text-xs transition-colors hover:bg-nx-raised/30"
                  aria-label={`${log.eventType} by ${log.username ?? "System"}`}
                >
                  {/* 1. Timestamp */}
                  <TableCell className="whitespace-nowrap font-mono text-[11px] tabular-nums text-nx-ink-3">
                    {formatDateTimeUtc(log.timestamp)}
                  </TableCell>

                  {/* 2. Actor */}
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {initials}
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="max-w-[105px] truncate font-semibold text-nx-ink">
                          {log.username ?? "System"}
                        </span>
                        {log.isAdmin && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 border border-primary/20 bg-primary/10 px-1 py-0 text-[9px] text-primary"
                          >
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* 3. Scope / Tenant */}
                  <TableCell className="whitespace-nowrap">
                    {log.tenantId ? (
                      <Badge
                        variant="outline"
                        className="border-nx-line bg-nx-raised px-1.5 py-0 font-mono text-[10px] text-nx-ink-3"
                      >
                        Tenant #{log.tenantId.slice(0, 6)}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-primary/30 bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary"
                      >
                        Platform
                      </Badge>
                    )}
                  </TableCell>

                  {/* 4. Action / Event Type */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 font-mono text-[11px] font-bold ${getActionBadgeStyle(
                        log.eventType
                      )}`}
                    >
                      {log.eventType}
                    </Badge>
                  </TableCell>

                  {/* 5. Resource Target */}
                  <TableCell className="text-nx-ink-3">
                    {log.entityType ? (
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="font-semibold text-nx-ink">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-nx-ink-3/80">
                            #{log.entityId.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-nx-ink-3/50">—</span>
                    )}
                  </TableCell>

                  {/* 6. Origin / IP */}
                  <TableCell className="hidden max-w-[180px] truncate font-mono text-[11px] text-nx-ink-3 lg:table-cell">
                    <div className="flex flex-col">
                      <span className="text-nx-ink">{log.ipAddress ?? "—"}</span>
                      {log.endpoint && (
                        <span className="truncate text-[10px] text-nx-ink-3/70">
                          {log.httpMethod ? `${log.httpMethod} ` : ""}
                          {log.endpoint}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 7. Status & Severity */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {log.isSuccess ? (
                        <CheckCircle2
                          className="h-3.5 w-3.5 shrink-0 text-success"
                          role="img"
                          aria-label={t("audit.filters.success")}
                        />
                      ) : (
                        <XCircle
                          className="h-3.5 w-3.5 shrink-0 text-destructive"
                          role="img"
                          aria-label={t("audit.filters.failed")}
                        />
                      )}
                      {getSeverityBadge(log)}
                    </div>
                  </TableCell>

                  {/* 8. Row Action */}
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer text-nx-ink-3 group-hover:text-nx-ink"
                      aria-label={t("common.view")}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(log.id);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center justify-between gap-3 px-1 text-xs text-nx-ink-3 sm:flex-row">
        <div className="flex items-center gap-2">
          <span>
            {t("audit.results.showingRange", {
              start: startItem,
              end: endItem,
              total: data.totalCount.toLocaleString(),
            }) || `Showing ${startItem}–${endItem} of ${data.totalCount.toLocaleString()} events`}
          </span>

          {onPageSizeChange && (
            <div className="ms-2 flex items-center gap-1.5">
              <span className="text-nx-ink-3">Per page:</span>
              <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {data.totalPages > 1 && (
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={!data.hasPreviousPage || undefined}
                  tabIndex={!data.hasPreviousPage ? -1 : undefined}
                  className={cn(
                    "h-7 px-2.5 text-xs",
                    !data.hasPreviousPage && "pointer-events-none opacity-50"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(data.pageNumber - 1);
                  }}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="px-2 font-mono text-xs tabular-nums text-nx-ink">
                  {data.pageNumber} / {data.totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!data.hasNextPage || undefined}
                  tabIndex={!data.hasNextPage ? -1 : undefined}
                  className={cn(
                    "h-7 px-2.5 text-xs",
                    !data.hasNextPage && "pointer-events-none opacity-50"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(data.pageNumber + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
});
