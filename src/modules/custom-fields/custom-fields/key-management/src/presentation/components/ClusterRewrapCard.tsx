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
    <Card className="shadow-sm border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <RefreshCw className={`h-5 w-5 ${isRunning ? "animate-spin text-primary" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                {t("customFieldsSecurity.clusterRewrapTitle")}
              </CardTitle>
              {isRunning && (
                <Badge variant="outline" className="text-primary border-primary/30 text-xs">
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
          <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
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
                className="text-destructive hover:bg-destructive/10 text-xs gap-1.5"
                onClick={() => onCancelRewrap(activeSession.id)}
                disabled={isCancellingRewrap}
              >
                <XCircle className="h-3.5 w-3.5" />
                {t("customFieldsSecurity.cancelClusterRewrap")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-4 w-4 text-primary shrink-0" />
              <span>
                {t("customFieldsSecurity.distributionDesc")}
              </span>
            </div>

            <Button
              size="sm"
              className="gap-2 shrink-0 text-xs"
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
