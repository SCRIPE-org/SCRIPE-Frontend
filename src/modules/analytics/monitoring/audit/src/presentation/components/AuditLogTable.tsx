"use client";

/**
 * Audit Log Table
 *
 * Presentational table component for audit log entries with pagination.
 * Extracted from AuditView for SOLID compliance.
 */
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
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { FileText, CheckCircle2, XCircle, Eye } from "lucide-react";
import { cn, formatDateTimeUtc } from "@core/common/utils";
import type { AuditLogPage } from "../../domain/entities/AuditEntities";

interface Props {
  data: AuditLogPage | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onRowClick: (id: string) => void;
  onPageChange: (page: number) => void;
}

/**
 * Exported constant defining parameters and fields for audit log table configurations.
 */
export const AuditLogTable = memo(function AuditLogTable({
  data,
  isLoading,
  error,
  onRetry,
  onRowClick,
  onPageChange,
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
      <div className="space-y-3" role="status" aria-label={t("common.loading")}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
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
        <EmptyState size="sm" bare icon={FileText} title={t("audit.results.noResults")} />
      </div>
    );
  }

  return (
    <div aria-live="polite">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">{t("audit.table.timestamp")}</TableHead>
            <TableHead>{t("audit.table.eventType")}</TableHead>
            <TableHead>{t("audit.table.user")}</TableHead>
            <TableHead>{t("audit.table.entity")}</TableHead>
            <TableHead className="w-[80px] text-center">{t("audit.table.status")}</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((log) => (
            <TableRow
              key={log.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => onRowClick(log.id)}
              onKeyDown={(e) => handleKeyDown(e, log.id)}
              tabIndex={0}
              role="button"
              aria-label={log.eventType + " - " + (log.username ?? "")}
            >
              <TableCell className="text-xs tabular-nums text-muted-foreground">
                {formatDateTimeUtc(log.timestamp)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {log.eventType}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                <div className="flex items-center gap-1.5">
                  {log.username ?? "—"}
                  {log.isAdmin && (
                    <Badge variant="secondary" className="px-1 py-0 text-[9px]">
                      Admin
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.entityType ? log.entityType + " #" + (log.entityId?.slice(0, 8) ?? "") : "—"}
              </TableCell>
              <TableCell className="text-center">
                {log.isSuccess ? (
                  <CheckCircle2
                    className="mx-auto h-4 w-4 text-success"
                    aria-label={t("audit.filters.success")}
                  />
                ) : (
                  <XCircle
                    className="mx-auto h-4 w-4 text-destructive"
                    aria-label={t("audit.filters.failed")}
                  />
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={t("common.view")}
                  tabIndex={-1}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination — composed from the core pagination primitives, which
          already flip their chevrons for RTL */}
      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm tabular-nums text-muted-foreground">
            {t("common.page")} {data.pageNumber} {t("common.of")} {data.totalPages}
          </span>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={!data.hasPreviousPage || undefined}
                  tabIndex={!data.hasPreviousPage ? -1 : undefined}
                  className={cn("h-8", !data.hasPreviousPage && "pointer-events-none opacity-50")}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(data.pageNumber - 1);
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!data.hasNextPage || undefined}
                  tabIndex={!data.hasNextPage ? -1 : undefined}
                  className={cn("h-8", !data.hasNextPage && "pointer-events-none opacity-50")}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(data.pageNumber + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
});
