/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@core/ui/table";
import { ShieldAlert, FileKey } from "lucide-react";
import type { EncryptionAuditLog } from "../../domain/entities/EncryptionAuditLog";

interface AuditLogTableProps {
  logs: EncryptionAuditLog[];
  totalCount: number;
  isLoading?: boolean;
}

/**
 * Documentation for module export
 */
export function AuditLogTable({ logs, totalCount, isLoading }: AuditLogTableProps) {
  const { t } = useI18n();

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base font-semibold">
              {t("customFieldsSecurity.auditLogsTitle")}
            </CardTitle>
            <CardDescription>{t("customFieldsSecurity.auditLogsDesc")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading audit trail...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No cryptographic events recorded yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-muted/40">
                  <TableHead className="text-xs">{t("customFieldsSecurity.action")}</TableHead>
                  <TableHead className="text-xs">{t("customFieldsSecurity.field")}</TableHead>
                  <TableHead className="text-xs">Key Ver</TableHead>
                  <TableHead className="text-xs">{t("customFieldsSecurity.actor")}</TableHead>
                  <TableHead className="text-xs">{t("customFieldsSecurity.ipAddress")}</TableHead>
                  <TableHead className="text-xs">{t("customFieldsSecurity.timestamp")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="font-mono transition-colors hover:bg-muted/15">
                    <TableCell className="px-3 py-2.5">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-sans">
                      <div className="flex items-center gap-1.5">
                        <FileKey className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {log.fieldKey || log.fieldDefinitionId.substring(0, 8)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-muted-foreground">
                      P#{log.platformKeyId} / T-v{log.tenantKeyVersion}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-sans">{log.actorId}</TableCell>
                    <TableCell className="px-3 py-2.5 text-muted-foreground">
                      {log.ipAddress || "—"}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 font-sans text-muted-foreground">
                      {log.formattedTimestamp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
