"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { ShieldAlert, FileKey } from "lucide-react";
import type { EncryptionAuditLog } from "../../domain/entities/EncryptionAuditLog";

interface AuditLogTableProps {
  logs: EncryptionAuditLog[];
  totalCount: number;
  isLoading?: boolean;
}

export function AuditLogTable({ logs, totalCount, isLoading }: AuditLogTableProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base font-semibold">
              {t("customFieldsSecurity.auditLogsTitle")}
            </CardTitle>
            <CardDescription>
              {t("customFieldsSecurity.auditLogsDesc")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No cryptographic events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2 px-3">{t("customFieldsSecurity.action")}</th>
                  <th className="py-2 px-3">{t("customFieldsSecurity.field")}</th>
                  <th className="py-2 px-3">Key Ver</th>
                  <th className="py-2 px-3">{t("customFieldsSecurity.actor")}</th>
                  <th className="py-2 px-3">{t("customFieldsSecurity.ipAddress")}</th>
                  <th className="py-2 px-3">{t("customFieldsSecurity.timestamp")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <FileKey className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{log.fieldKey || log.fieldDefinitionId.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      P#{log.platformKeyId} / T-v{log.tenantKeyVersion}
                    </td>
                    <td className="py-2.5 px-3 font-sans">{log.actorId}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{log.ipAddress || "—"}</td>
                    <td className="py-2.5 px-3 text-muted-foreground font-sans">
                      {log.formattedTimestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
