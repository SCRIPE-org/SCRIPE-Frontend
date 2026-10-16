"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Progress } from "@core/ui/progress";
import { RefreshCw, Play, XCircle, Layers } from "lucide-react";
import type { MigrationSession } from "../../domain/entities/MigrationSession";

interface ClusterRewrapCardProps {
  activeSession: MigrationSession | null;
  onStartClusterRewrap: () => void;
  isStartingRewrap: boolean;
  onCancelRewrap: (sessionId: string) => void;
  isCancellingRewrap: boolean;
}

/**
 * Documentation for ClusterRewrapCard
 */
export function ClusterRewrapCard({
  activeSession,
  onStartClusterRewrap,
  isStartingRewrap,
  onCancelRewrap,
  isCancellingRewrap,
}: ClusterRewrapCardProps) {
  const { t } = useI18n();

  const isRunning = Boolean(activeSession?.isRunning);

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <RefreshCw className={`h-5 w-5 ${isRunning ? "animate-spin text-primary" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                {t("customFieldsSecurity.clusterRewrapTitle")}
              </CardTitle>
              {isRunning && (
                <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                  {t("customFieldsSecurity.clusterMigrationRunning")}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              {isRunning
                ? t("customFieldsSecurity.clusterRewrapActiveDesc")
                : t("customFieldsSecurity.clusterRewrapDesc")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {activeSession && isRunning ? (
          <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {t("customFieldsSecurity.progress")} ({activeSession.progressPercentage}%)
              </span>
              <span className="font-mono text-muted-foreground">
                {activeSession.migratedRecords} / {activeSession.totalRecords}{" "}
                {t("customFieldsSecurity.recordsMigrated")}
              </span>
            </div>

            <Progress value={activeSession.progressPercentage} className="h-2" />

            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => onCancelRewrap(activeSession.id)}
                disabled={isCancellingRewrap}
              >
                <XCircle className="h-3.5 w-3.5" />
                {t("customFieldsSecurity.cancelClusterRewrap")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 pt-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-4 w-4 shrink-0 text-primary" />
              <span>{t("customFieldsSecurity.distributionDesc")}</span>
            </div>

            <Button
              size="sm"
              className="shrink-0 gap-2 text-xs"
              onClick={onStartClusterRewrap}
              disabled={isStartingRewrap}
            >
              <Play className="h-3.5 w-3.5" />
              {t("customFieldsSecurity.startClusterRewrapButton")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
