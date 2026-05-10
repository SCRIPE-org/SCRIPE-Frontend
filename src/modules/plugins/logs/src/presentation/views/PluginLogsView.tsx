"use client";

import { useLogsViewModel } from "../viewmodels/useLogsViewModel";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle, RefreshCw, Activity } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { LogRow } from "../components/LogRow";
import { LogsPagination } from "../components/LogsPagination";

interface PluginLogsViewProps {
  installationId: string;
}

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
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{t("plugins.logsError")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 me-2" />
          {t("plugins.retry")}
        </Button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Activity className="h-10 w-10" />
        <p className="text-sm">{t("plugins.logsEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
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

      <LogsPagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
