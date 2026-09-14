"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  ChangeFieldTypeResult,
  RollbackFieldTypeChangeResult,
} from "../../domain/entities/FieldInsight";

export interface ConvertValueTypeResultViewProps {
  lastResult: ChangeFieldTypeResult | null;
  lastRollbackResult: RollbackFieldTypeChangeResult | null;
  canUpdate: boolean;
  isRollingBack: boolean;
  onExecuteRollback: (jobRunId: string) => Promise<void>;
  onCopyJobId: (jobRunId: string) => void;
}

export function ConvertValueTypeResultView({
  lastResult,
  lastRollbackResult,
  canUpdate,
  isRollingBack,
  onExecuteRollback,
  onCopyJobId,
}: ConvertValueTypeResultViewProps): React.ReactElement | null {
  const { t } = useI18n();

  if (!lastResult) return null;

  return (
    <div className="space-y-3 pt-2">
      {lastResult.applied ? (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{t("customField.convertValueType.result.appliedTitle")}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {t("customField.convertValueType.result.appliedDescription", {
                converted: lastResult.converted,
                examined: lastResult.examined,
              })}
            </p>

            {lastResult.jobRunId && !lastRollbackResult && (
              <div className="mt-3 flex items-center justify-between rounded border border-success/30 bg-success/10 p-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-nx-ink-3">
                    Job ID: {lastResult.jobRunId.substring(0, 8)}...
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onCopyJobId(String(lastResult.jobRunId))}
                    title={t("common.copy")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {canUpdate && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => onExecuteRollback(String(lastResult.jobRunId))}
                    disabled={isRollingBack}
                  >
                    <RotateCcw className="me-1 h-3 w-3" />
                    {isRollingBack
                      ? t("customField.convertValueType.rollbackInProgress")
                      : t("customField.convertValueType.rollbackButton")}
                  </Button>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t("customField.convertValueType.result.refusedTitle")}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {t("customField.convertValueType.result.refusedDescription", {
                count: lastResult.totalRefusals,
              })}
            </p>

            {lastResult.refusals && lastResult.refusals.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded border border-destructive/20 bg-destructive/5 p-2 text-xs">
                <ul className="space-y-1.5 divide-y divide-destructive/10">
                  {lastResult.refusals.map((ref, idx) => (
                    <li key={ref.entityFieldValueId || idx} className="pt-1 first:pt-0">
                      <span className="font-mono font-medium">
                        Record: {ref.ownerEntityId}
                      </span>
                      <p className="text-nx-ink-3">{ref.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* A rollback that ran is not the same as a rollback that restored everything */}
      {lastRollbackResult &&
        (lastRollbackResult.valuesGone + lastRollbackResult.unreadable > 0 ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {t("customField.convertValueType.result.rolledBackPartialTitle")}
            </AlertTitle>
            <AlertDescription>
              {t("customField.convertValueType.result.rolledBackPartialDescription", {
                restored: lastRollbackResult.restored,
                snapshotsFound: lastRollbackResult.snapshotsFound,
                valuesGone: lastRollbackResult.valuesGone,
                unreadable: lastRollbackResult.unreadable,
              })}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>
              {t("customField.convertValueType.result.rolledBackTitle")}
            </AlertTitle>
            <AlertDescription>
              {t("customField.convertValueType.result.rolledBackDescription", {
                restored: lastRollbackResult.restored,
              })}
            </AlertDescription>
          </Alert>
        ))}
    </div>
  );
}
