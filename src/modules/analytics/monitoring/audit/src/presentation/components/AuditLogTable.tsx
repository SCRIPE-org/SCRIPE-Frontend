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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import {
  CheckCircle2,
  Eye,
  FileText,
  XCircle,
} from "lucide-react";
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
  if (eventType.includes("Create") || eventType.includes("Assigned") || eventType.includes("Granted")) {
    return "border-emerald-500/40 text-emerald-500 bg-emerald-500/10";
  }
  if (eventType.includes("Delete") || eventType.includes("Revoked") || eventType.includes("Denied")) {
    return "border-rose-500/40 text-rose-500 bg-rose-500/10";
  }
  if (eventType.includes("Update") || eventType.includes("StatusChanged") || eventType.includes("Transfer")) {
    return "border-blue-500/40 text-blue-500 bg-blue-500/10";
  }
  if (eventType.includes("Login") || eventType.includes("Token")) {
    return "border-purple-500/40 text-purple-500 bg-purple-500/10";
  }
  if (eventType.includes("Password") || eventType.includes("TwoFactor") || eventType.includes("Locked")) {
    return "border-amber-500/40 text-amber-500 bg-amber-500/10";
  }
  return "border-border text-foreground bg-muted/40";
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
          className="text-[10px] font-bold uppercase tracking-wider border-rose-500/50 text-rose-500 bg-rose-500/10 px-1.5 py-0"
        >
          Critical
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-bold uppercase tracking-wider border-amber-500/50 text-amber-500 bg-amber-500/10 px-1.5 py-0"
      >
        Warning
      </Badge>
    );
  }
  if (log.eventType.includes("Delete") || log.eventType.includes("Password")) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-bold uppercase tracking-wider border-amber-500/50 text-amber-500 bg-amber-500/10 px-1.5 py-0"
      >
        Warning
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-bold uppercase tracking-wider border-border/80 text-muted-foreground bg-muted/30 px-1.5 py-0"
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
      <div className="overflow-x-auto rounded-lg border border-border/80">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[145px] text-xs font-semibold text-muted-foreground">
                {t("audit.table.timestamp") || "Timestamp (UTC)"}
              </TableHead>
              <TableHead className="w-[180px] text-xs font-semibold text-muted-foreground">
                {t("audit.table.user") || "Actor"}
              </TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground">
                {t("audit.table.tenant") || "Scope"}
              </TableHead>
              <TableHead className="w-[170px] text-xs font-semibold text-muted-foreground">
                {t("audit.table.eventType") || "Action"}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                {t("audit.table.entity") || "Resource"}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                {t("audit.table.origin") || "Origin / Client"}
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold text-muted-foreground text-center">
                {t("audit.table.status") || "Status"}
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
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
                  className="hover:bg-accent/40 transition-colors group cursor-pointer text-xs"
                  aria-label={`${log.eventType} by ${log.username ?? "System"}`}
                >
                  {/* 1. Timestamp */}
                  <TableCell className="tabular-nums text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                    {formatDateTimeUtc(log.timestamp)}
                  </TableCell>

                  {/* 2. Actor */}
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0 flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate max-w-[105px]">
                          {log.username ?? "System"}
                        </span>
                        {log.isAdmin && (
                          <Badge
                            variant="secondary"
                            className="px-1 py-0 text-[9px] bg-primary/10 text-primary border border-primary/20 shrink-0"
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
                        className="text-[10px] font-mono border-border/80 text-muted-foreground bg-card px-1.5 py-0"
                      >
                        Tenant #{log.tenantId.slice(0, 6)}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold border-primary/30 text-primary bg-primary/5 px-1.5 py-0"
                      >
                        Platform
                      </Badge>
                    )}
                  </TableCell>

                  {/* 4. Action / Event Type */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-mono text-[11px] px-2 py-0.5 font-bold ${getActionBadgeStyle(
                        log.eventType
                      )}`}
                    >
                      {log.eventType}
                    </Badge>
                  </TableCell>

                  {/* 5. Resource Target */}
                  <TableCell className="text-muted-foreground">
                    {log.entityType ? (
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="font-semibold text-foreground">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-muted-foreground/80">
                            #{log.entityId.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* 6. Origin / IP */}
                  <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-[11px] truncate max-w-[180px]">
                    <div className="flex flex-col">
                      <span className="text-foreground">{log.ipAddress ?? "—"}</span>
                      {log.endpoint && (
                        <span className="text-[10px] text-muted-foreground/70 truncate">
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
                          className="h-3.5 w-3.5 text-emerald-500 shrink-0"
                          role="img"
                          aria-label={t("audit.filters.success")}
                        />
                      ) : (
                        <XCircle
                          className="h-3.5 w-3.5 text-rose-500 shrink-0"
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
                      className="h-7 w-7 text-muted-foreground group-hover:text-foreground cursor-pointer"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {t("audit.results.showingRange", {
              start: startItem,
              end: endItem,
              total: data.totalCount.toLocaleString(),
            }) ||
              `Showing ${startItem}–${endItem} of ${data.totalCount.toLocaleString()} events`}
          </span>

          {onPageSizeChange && (
            <div className="flex items-center gap-1.5 ms-2">
              <span className="text-muted-foreground/70">Per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange(Number(v))}
              >
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
                    "h-7 text-xs px-2.5",
                    !data.hasPreviousPage && "pointer-events-none opacity-50"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(data.pageNumber - 1);
                  }}
                />
              </PaginationItem>

              <PaginationItem>
                <span className="px-2 font-mono text-xs tabular-nums text-foreground">
                  {data.pageNumber} / {data.totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!data.hasNextPage || undefined}
                  tabIndex={!data.hasNextPage ? -1 : undefined}
                  className={cn(
                    "h-7 text-xs px-2.5",
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
