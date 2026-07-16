"use client";

/**
 * Blocked IPs Section
 *
 * Table of IP addresses with the most failed login attempts.
 */
import { memo } from "react";
import type { BlockedIPSummary } from "../../domain/entities/DashboardEntities";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import { Badge } from "@core/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Globe } from "lucide-react";

interface Props {
  data: BlockedIPSummary[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Exported constant defining parameters and fields for blocked i ps section configurations.
 */
export const BlockedIPsSection = memo(function BlockedIPsSection({
  data,
  isLoading,
  error,
  onRetry,
}: Props) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-red-500" />
          <div>
            <CardTitle>{t("dashboard.blockedIPs.title")}</CardTitle>
            <CardDescription>{t("dashboard.blockedIPs.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={data.length === 0}
          emptyMessage={t("dashboard.blockedIPs.noBlocked")}
          skeletonType="rows"
          skeletonRows={5}
          height={100}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.blockedIPs.ipAddress")}</TableHead>
                <TableHead>{t("dashboard.blockedIPs.attempts")}</TableHead>
                <TableHead>{t("dashboard.blockedIPs.lastUser")}</TableHead>
                <TableHead>{t("dashboard.blockedIPs.lastAttempt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((ip) => (
                <TableRow key={ip.ipAddress}>
                  <TableCell className="font-mono text-sm">{ip.ipAddress}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ip.failedCount > 20
                          ? "destructive"
                          : ip.failedCount > 5
                            ? "default"
                            : "secondary"
                      }
                      className="tabular-nums"
                    >
                      {ip.failedCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ip.lastUsername ?? "—"}</TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {formatDateTimeUtc(ip.latestAttempt)}
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
