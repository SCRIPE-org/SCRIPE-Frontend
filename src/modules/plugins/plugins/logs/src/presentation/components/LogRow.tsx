"use client";

import { Badge } from "@core/ui/badge";
import { TableCell, TableRow } from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import type { PluginExecutionLog } from "../../domain/entities/PluginExecutionLog";

interface LogRowProps {
  log: PluginExecutionLog;
}

/**
 * Presentation UI component rendering the log row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function LogRow({ log }: LogRowProps) {
  const { t } = useI18n();
  return (
    <TableRow>
      <TableCell>
        <Badge variant={log.isSuccess ? "default" : "destructive"} className="text-xs">
          {log.isSuccess ? t("plugins.logsStatusOk") : t("plugins.logsStatusFail")}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 items-center gap-2">
          {log.statusCode != null && (
            <span className="shrink-0 text-xs text-nx-ink-3">{log.statusCode}</span>
          )}
          <span className="truncate font-mono text-xs text-nx-ink-2">{log.endpoint}</span>
        </div>
      </TableCell>
      <TableCell variant="numeric" className="text-nx-ink-2">
        {log.durationMs}ms
      </TableCell>
      <TableCell className="hidden text-xs text-nx-ink-3 sm:table-cell">
        {formatDateTimeUtc(log.executedAt)}
      </TableCell>
    </TableRow>
  );
}
