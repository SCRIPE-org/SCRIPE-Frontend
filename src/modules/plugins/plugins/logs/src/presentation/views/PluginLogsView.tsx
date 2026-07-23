"use client";

import { useLogsViewModel } from "../viewmodels/useLogsViewModel";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { RefreshCw, Activity } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LogRow } from "../components/LogRow";

interface PluginLogsViewProps {
  installationId: string;
}

/**
 * Presentation UI component rendering the plugin logs view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PluginLogsView({ installationId }: PluginLogsViewProps) {
  const { t } = useI18n();
  const { logs, isLoading, isError, refetch, page, totalPages, goToPage, totalCount } =
    useLogsViewModel(installationId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorMessage message={t("plugins.logsError")} onRetry={() => refetch()} className="py-16" />
    );
  }

  if (logs.length === 0) {
    return <EmptyState icon={Activity} title={t("plugins.logsEmpty")} className="my-6" />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {t("plugins.logsTotalExecutions", { count: String(totalCount) })}
        </span>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="divide-y">
        {logs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </div>

      {/* Pagination — composed from the core pagination primitives */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t p-4">
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page === 1 || undefined}
                  tabIndex={page === 1 ? -1 : undefined}
                  className={cn("h-8", page === 1 && "pointer-events-none opacity-50")}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(page - 1);
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-xs tabular-nums text-muted-foreground">
                  {t("plugins.logsPage", { page: String(page), total: String(totalPages) })}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page === totalPages || undefined}
                  tabIndex={page === totalPages ? -1 : undefined}
                  className={cn("h-8", page === totalPages && "pointer-events-none opacity-50")}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
