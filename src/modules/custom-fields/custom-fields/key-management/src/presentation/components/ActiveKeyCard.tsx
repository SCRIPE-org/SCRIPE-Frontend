"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ShieldCheck, KeyRound, RotateCw, AlertOctagon, Lock } from "lucide-react";
import type { TenantKeyStatus } from "../../domain/entities/TenantKeyStatus";

interface ActiveKeyCardProps {
  status: TenantKeyStatus | null;
  onInitialize: () => void;
  onRotate: () => void;
  onRevoke: () => void;
  isInitializing?: boolean;
}

/**
 * Documentation for ActiveKeyCard
 */
export function ActiveKeyCard({
  status,
  onInitialize,
  onRotate,
  onRevoke,
  isInitializing,
}: ActiveKeyCardProps) {
  const { t } = useI18n();

  if (!status || !status.isInitialized) {
    return (
      <Card className="border border-amber-500/30 bg-amber-500/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg text-amber-700 dark:text-amber-300">
                {t("customFieldsSecurity.uninitializedTitle")}
              </CardTitle>
              <CardDescription className="text-amber-700/80 dark:text-amber-300/80">
                {t("customFieldsSecurity.uninitializedDesc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onInitialize}
            disabled={isInitializing}
            className="gap-2 bg-amber-600 font-medium text-white shadow-sm hover:bg-amber-700"
          >
            <Lock className="h-4 w-4" />
            {isInitializing ? t("common.loading") : t("customFieldsSecurity.initializeButton")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isRevoked = status.status === "Revoked";

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{t("customFieldsSecurity.activeKey")}</CardTitle>
              <Badge variant={isRevoked ? "destructive" : "default"}>
                {isRevoked
                  ? t("customFieldsSecurity.statusRevoked")
                  : t("customFieldsSecurity.statusActive")}
              </Badge>
            </div>
            <CardDescription className="font-mono text-xs">
              {status.tenantCode} • {status.providerType}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRotate}
            disabled={isRevoked}
            className="gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {t("customFieldsSecurity.rotateButton")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            disabled={isRevoked}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            {t("customFieldsSecurity.revokeButton")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 border-t border-border/50 pt-2 text-sm sm:grid-cols-4">
        <div>
          <span className="block text-xs text-muted-foreground">
            {t("customFieldsSecurity.activeVersion")}
          </span>
          <span className="font-mono text-base font-semibold">v{status.activeVersion}</span>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground">
            {t("customFieldsSecurity.platformKeyId")}
          </span>
          <span className="font-mono text-base font-semibold">#{status.currentPlatformKeyId}</span>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground">
            {t("customFieldsSecurity.lastRotated")}
          </span>
          <span className="text-sm font-medium">
            {status.lastRotatedAt ? new Date(status.lastRotatedAt).toLocaleDateString() : "—"}
          </span>
        </div>
        <div>
          <span className="block text-xs text-muted-foreground">
            {t("customFieldsSecurity.encryptedRecords")}
          </span>
          <span className="font-mono text-base font-semibold">
            {status.totalEncryptedRecords.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
