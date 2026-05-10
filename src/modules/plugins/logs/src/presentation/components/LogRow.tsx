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
    <div className="flex items-center justify-between border-b last:border-0 py-3 px-4 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Badge
          variant={log.isSuccess ? "default" : "destructive"}
          className="text-xs shrink-0"
        >
          {log.isSuccess ? t("plugins.logsStatusOk") : t("plugins.logsStatusFail")}
        </Badge>
        {log.statusCode != null && (
          <span className="text-xs text-muted-foreground shrink-0">{log.statusCode}</span>
        )}
        <span className="text-xs font-mono truncate text-muted-foreground">{log.endpoint}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0 ms-4">
        <span className="text-xs text-muted-foreground">{log.durationMs}ms</span>
        <span className="text-xs text-muted-foreground hidden sm:block">
          {log.executedAt.toLocaleTimeString()} {log.executedAt.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
