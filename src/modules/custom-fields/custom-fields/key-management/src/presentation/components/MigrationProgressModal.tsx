"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Loader2, XSquare } from "lucide-react";
import type { MigrationSession } from "../../domain/entities/MigrationSession";

interface MigrationProgressModalProps {
  session: MigrationSession | null;
  onCancel: (sessionId: string) => void;
  isCancelling?: boolean;
}

/**
 * Documentation for MigrationProgressModal
 */
export function MigrationProgressModal({
  session,
  onCancel,
  isCancelling,
}: MigrationProgressModalProps) {
  const { t } = useI18n();

  if (!session || session.isTerminal) return null;

  return (
    <Card className="border-primary/40 bg-primary/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <CardTitle className="text-base text-primary">
            {t("customFieldsSecurity.migrationInProgress")}
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(session.id)}
          disabled={isCancelling}
          className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
        >
          <XSquare className="h-3.5 w-3.5" />
          {t("customFieldsSecurity.cancelMigration")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between font-mono text-xs">
            <span>
              Platform #{session.fromPlatformKeyId} → #{session.toPlatformKeyId} | Tenant v
              {session.fromTenantVersion} → v{session.toTenantVersion}
            </span>
            <span className="font-semibold">{session.progressPercentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.max(2, session.progressPercentage)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs text-muted-foreground">
          <span>
            {t("customFieldsSecurity.processed")}: {session.migratedRecords} /{" "}
            {session.totalRecords}
          </span>
          {session.failedRecords > 0 && (
            <span className="text-destructive">
              {t("customFieldsSecurity.failed")}: {session.failedRecords}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
