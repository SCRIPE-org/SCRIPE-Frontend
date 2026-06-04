"use client";

import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type { PluginExecutionLog } from "../../domain/entities/PluginExecutionLog";

interface LogRowProps {
  log: PluginExecutionLog;
}

export function LogRow({ log }: LogRowProps) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 transition-colors last:border-0 hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-3">
        <Badge variant={log.isSuccess ? "default" : "destructive"} className="shrink-0 text-xs">
          {log.isSuccess ? t("plugins.logsStatusOk") : t("plugins.logsStatusFail")}
        </Badge>
        {log.statusCode != null && (
          <span className="shrink-0 text-xs text-muted-foreground">{log.statusCode}</span>
        )}
        <span className="truncate font-mono text-xs text-muted-foreground">{log.endpoint}</span>
      </div>
      <div className="ms-4 flex shrink-0 items-center gap-4">
        <span className="text-xs text-muted-foreground">{log.durationMs}ms</span>
        <span className="hidden text-xs text-muted-foreground sm:block">
          {log.executedAt.toLocaleTimeString()} {log.executedAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
