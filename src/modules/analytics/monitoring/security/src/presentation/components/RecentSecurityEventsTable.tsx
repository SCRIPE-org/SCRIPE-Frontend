"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { SectionState } from "@core/ui/section-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Shield, Eye, ExternalLink } from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";
import type { SecurityChange } from "../../domain/entities/SecurityEntities";

interface RecentSecurityEventsTableProps {
  events: SecurityChange[];
  isLoading: boolean;
  onSelectEvent: (event: SecurityChange) => void;
  onRetry?: () => void;
  cardClasses?: string;
}

const EVENT_TYPE_BADGE_VARIANTS: Record<
  string,
  "destructive" | "warning" | "success" | "secondary" | "outline"
> = {
  LoginSuccess: "success",
  LoginFailed: "destructive",
  AccountLocked: "destructive",
  AccessDenied: "warning",
  PrivilegeEscalationAttempt: "destructive",
  PrivilegeEscalation: "destructive",
  SessionRevoked: "secondary",
  PasswordReset: "outline",
};

/**
 * RecentSecurityEventsTable
 */
export const RecentSecurityEventsTable = memo(function RecentSecurityEventsTable({
  events,
  isLoading,
  onSelectEvent,
  onRetry,
  cardClasses,
}: RecentSecurityEventsTableProps) {
  const { t } = useI18n();

  return (
    <Card className={`flex h-full flex-col ${cardClasses || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Shield className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {t("security.events.title") || "Recent Security Events"}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("security.events.subtitle") ||
                  "Audit events, authentication attempts and security state mutations"}
              </CardDescription>
            </div>
          </div>

          <Link
            href="/audit"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>{t("security.events.viewAllAudit") || "View in Audit Log"}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <SectionState
          isLoading={isLoading}
          onRetry={onRetry}
          isEmpty={events.length === 0}
          emptyMessage={
            t("security.events.noEvents") || "No security events recorded in this period."
          }
          skeletonType="rows"
          skeletonRows={5}
          height={240}
        >
          <div className="max-h-[340px] overflow-x-auto overflow-y-auto pe-1">
            <Table>
              <TableHeader className="shadow-xs sticky top-0 z-10 bg-card">
                <TableRow className="border-b border-border">
                  <TableHead className="bg-card text-xs font-semibold">
                    {t("security.events.time") || "Timestamp"}
                  </TableHead>
                  <TableHead className="bg-card text-xs font-semibold">
                    {t("security.events.eventType") || "Event Type"}
                  </TableHead>
                  <TableHead className="bg-card text-xs font-semibold">
                    {t("security.events.actor") || "Actor / User"}
                  </TableHead>
                  <TableHead className="bg-card text-xs font-semibold">
                    {t("security.events.sourceIp") || "IP Address"}
                  </TableHead>
                  <TableHead className="bg-card text-center text-xs font-semibold">
                    {t("common.status") || "Status"}
                  </TableHead>
                  <TableHead className="bg-card text-end text-xs font-semibold">
                    {t("common.details") || "Details"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event, idx) => {
                  const badgeVariant =
                    EVENT_TYPE_BADGE_VARIANTS[event.eventType] ??
                    (event.isSuccess ? "outline" : "destructive");
                  const eventKey =
                    event.id && event.id.trim() !== ""
                      ? event.id
                      : `event-${event.eventType}-${event.timestamp}-${idx}`;

                  return (
                    <TableRow
                      key={eventKey}
                      onClick={() => onSelectEvent(event)}
                      className="cursor-pointer transition-colors hover:bg-accent/40"
                    >
                      <TableCell className="whitespace-nowrap py-2.5 text-xs tabular-nums text-muted-foreground">
                        {formatDateTimeUtc(event.timestamp)}
                      </TableCell>

                      <TableCell className="py-2.5">
                        <Badge variant={badgeVariant} className="px-1.5 py-0 font-mono text-[10px]">
                          {event.eventType}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2.5 text-xs font-medium text-foreground">
                        {event.username || "System / Anonymous"}
                      </TableCell>

                      <TableCell
                        className="py-2.5 font-mono text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {event.ipAddress || "—"}
                      </TableCell>

                      <TableCell className="py-2.5 text-center">
                        <Badge
                          variant={event.isSuccess ? "success" : "destructive"}
                          className="text-[10px] font-bold uppercase"
                        >
                          {event.isSuccess ? "Success" : "Blocked"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2.5 text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(event);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="View event details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </SectionState>
      </CardContent>
    </Card>
  );
});
