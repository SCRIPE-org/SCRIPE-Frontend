"use client";

import React, { useState, memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { SectionState } from "@core/ui/section-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Laptop, Monitor, Smartphone, Globe, LogOut } from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";
import type { ActiveSession } from "../../domain/entities/SecurityEntities";

interface ActiveSessionsTableProps {
  sessions: ActiveSession[];
  isLoading: boolean;
  onRevokeSession: (tokenId: string) => void;
  isRevoking: boolean;
  onRetry?: () => void;
  cardClasses?: string;
}

function parseDeviceInfo(ua: string): { name: string; icon: typeof Laptop } {
  if (!ua || ua === "Unknown" || ua === "Unknown Browser / OS") {
    return { name: "Web Browser", icon: Globe };
  }
  if (ua.length < 30 && !ua.includes("Mozilla")) {
    return { name: ua, icon: Laptop };
  }

  let browser = "Web Client";
  let os = "Desktop";
  let Icon = Laptop;

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("curl") || ua.includes("Postman")) browser = "API Client";

  if (ua.includes("Windows")) {
    os = "Windows";
    Icon = Monitor;
  } else if (ua.includes("Macintosh") || ua.includes("Mac OS")) {
    os = "macOS";
    Icon = Laptop;
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
    Icon = Smartphone;
  } else if (ua.includes("Android")) {
    os = "Android";
    Icon = Smartphone;
  } else if (ua.includes("Linux")) {
    os = "Linux";
    Icon = Monitor;
  }

  return { name: `${browser} · ${os}`, icon: Icon };
}

/**
 * ActiveSessionsTable
 */
export const ActiveSessionsTable = memo(function ActiveSessionsTable({
  sessions,
  isLoading,
  onRevokeSession,
  isRevoking,
  onRetry,
  cardClasses,
}: ActiveSessionsTableProps) {
  const { t } = useI18n();
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const handleConfirmRevoke = () => {
    if (selectedTokenId) {
      onRevokeSession(selectedTokenId);
      setSelectedTokenId(null);
    }
  };

  return (
    <Card className={`flex h-full flex-col ${cardClasses || ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-sky-500/10 p-1.5 text-sky-500">
              <Laptop className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {t("security.sessions.title") || "Active Sessions & Access"}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("security.sessions.description") ||
                  "Currently authenticated sessions and connected devices"}
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="text-xs font-medium">
            {t("security.sessions.count", { count: sessions.length }) ||
              `${sessions.length} Active`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <SectionState
          isLoading={isLoading}
          onRetry={onRetry}
          isEmpty={sessions.length === 0}
          emptyMessage={
            t("security.sessions.noSessions") || "No active authenticated sessions found."
          }
          skeletonType="rows"
          skeletonRows={3}
          height={200}
        >
          <div className="max-h-[340px] overflow-x-auto overflow-y-auto pe-1">
            <Table>
              <TableHeader className="shadow-xs sticky top-0 z-10 bg-card">
                <TableRow className="border-b border-border">
                  <TableHead className="bg-card text-xs font-semibold">
                    {t("security.sessions.device") || "Device / Client"}
                  </TableHead>
                  <TableHead className="bg-card text-xs font-semibold">
                    {t("security.sessions.ipAddress") || "IP Address"}
                  </TableHead>
                  <TableHead className="bg-card text-xs font-semibold">
                    {t("security.sessions.created") || "Logged In"}
                  </TableHead>
                  <TableHead className="bg-card text-center text-xs font-semibold">
                    {t("common.status") || "Status"}
                  </TableHead>
                  <TableHead className="bg-card text-end text-xs font-semibold">
                    {t("common.actions") || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((sess, idx) => {
                  const parsed = parseDeviceInfo(sess.deviceInfo);
                  const Icon = parsed.icon;
                  const sessionKey =
                    sess.tokenId && sess.tokenId.trim() !== ""
                      ? sess.tokenId
                      : `session-${sess.ipAddress}-${idx}`;

                  return (
                    <TableRow key={sessionKey} className="hover:bg-accent/40">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-muted/60 p-1 text-muted-foreground">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{parsed.name}</span>
                        </div>
                      </TableCell>

                      <TableCell
                        className="py-2.5 font-mono text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {sess.ipAddress}
                      </TableCell>

                      <TableCell className="py-2.5 text-xs tabular-nums text-muted-foreground">
                        {formatDateTimeUtc(sess.createdAt)}
                      </TableCell>

                      <TableCell className="py-2.5 text-center">
                        {sess.isCurrent ? (
                          <Badge variant="success" className="text-[10px] font-bold uppercase">
                            {t("security.sessions.current") || "Current"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                            {t("security.sessions.active") || "Active"}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="py-2.5 text-end">
                        {sess.isCurrent ? (
                          <span className="text-[11px] italic text-muted-foreground">
                            {t("security.sessions.thisDevice") || "This Device"}
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTokenId(sess.tokenId)}
                            disabled={isRevoking}
                            className="h-7 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>{t("security.sessions.revoke") || "Revoke"}</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </SectionState>
      </CardContent>

      {/* Confirmation Dialog for Session Revocation */}
      <ConfirmationDialog
        open={Boolean(selectedTokenId)}
        onOpenChange={(open) => !open && setSelectedTokenId(null)}
        title={t("security.sessions.revokeTitle") || "Revoke Active Session?"}
        description={
          t("security.sessions.revokeConfirm") ||
          "This will immediately invalidate the session and force sign-out on the connected device. This action cannot be undone."
        }
        confirmText={t("security.sessions.revokeAction") || "Revoke Session"}
        variant="destructive"
        onConfirm={handleConfirmRevoke}
      />
    </Card>
  );
});
