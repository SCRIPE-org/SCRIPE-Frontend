"use client";

/**
 * Blocked IPs Table
 *
 * Shows table of blocked IP addresses with their failed attempt counts.
 * Uses SectionState for consistent loading/error/empty states.
 */
import { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { SectionState } from "@core/ui/section-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Shield } from "lucide-react";
import type { BlockedIP } from "../../domain/entities/SecurityEntities";

interface Props {
  data: BlockedIP[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

/**
 * Exported constant defining parameters and fields for blocked i ps table configurations.
 */
export const BlockedIPsTable = memo(function BlockedIPsTable({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-orange-500" aria-hidden="true" />
          <CardTitle className="text-base">{t("security.blockedIPs.title")}</CardTitle>
        </div>
        <CardDescription>{t("security.blockedIPs.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={data.length === 0}
          emptyMessage={t("dashboard.blockedIPs.noBlocked")}
          height={200}
          skeletonType="rows"
          skeletonRows={5}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.blockedIPs.ipAddress")}</TableHead>
                <TableHead className="text-center">{t("dashboard.blockedIPs.attempts")}</TableHead>
                <TableHead>{t("dashboard.blockedIPs.lastAttempt")}</TableHead>
                <TableHead className="text-center">{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((ip) => (
                <TableRow key={ip.ipAddress}>
                  <TableCell className="font-mono text-sm">{ip.ipAddress}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={ip.failedCount >= 10 ? "destructive" : "secondary"}
                      className="tabular-nums"
                    >
                      {ip.failedCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {new Date(ip.latestAttempt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ip.failedCount >= 5 ? "destructive" : "outline"}>
                      {ip.failedCount >= 5
                        ? t("dashboard.blockedIPs.blocked")
                        : t("dashboard.blockedIPs.active")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionState>
      </CardContent>
    </Card>
  );
});
