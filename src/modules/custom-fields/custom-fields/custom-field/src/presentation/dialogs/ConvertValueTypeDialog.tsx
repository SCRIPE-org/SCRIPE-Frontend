/**
 * Value-Type Conversion Dialog (Wave 6 row 6.2)
 *
 * Provides operators with type compatibility preview, lossy data confirmation gating,
 * dry-run refusal inspection, execution, and rollback.
 */
"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Info,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import type {
  ChangeFieldTypeResult,
  ConversionKind,
  RollbackFieldTypeChangeResult,
} from "../../domain/entities/FieldInsight";
import { classifyValueTypeConversion } from "../../domain/valueTypeConversion";

export interface ConvertValueTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldId: string;
  fieldLabel: string;
  fieldKey: string;
  currentType: string;
  availableTargetTypes: readonly string[];
  selectedTargetType: string;
  onSelectTargetType: (type: string) => void;
  confirmDataLoss: boolean;
  onConfirmDataLossChange: (checked: boolean) => void;
  conversionKind: ConversionKind | null;
  isLossy: boolean;
  canExecute: boolean;
  canUpdate: boolean;
  isConverting: boolean;
  onExecuteConvert: () => Promise<void>;
  lastResult: ChangeFieldTypeResult | null;
  isRollingBack: boolean;
  onExecuteRollback: (jobRunId: string) => Promise<void>;
  lastRollbackResult: RollbackFieldTypeChangeResult | null;
}

export const ConvertValueTypeDialog = React.memo(function ConvertValueTypeDialog({
  open,
  onOpenChange,
  fieldLabel,
  fieldKey,
  currentType,
  availableTargetTypes,
  selectedTargetType,
  onSelectTargetType,
  confirmDataLoss,
  onConfirmDataLossChange,
  conversionKind,
  isLossy,
  canExecute,
  canUpdate,
  isConverting,
  onExecuteConvert,
  lastResult,
  isRollingBack,
  onExecuteRollback,
  lastRollbackResult,
}: ConvertValueTypeDialogProps) {
  const { t } = useI18n();

  const handleCopyJobId = (jobRunId: string) => {
    navigator.clipboard.writeText(jobRunId);
    toast.success(t("customField.convertValueType.jobIdCopied"));
  };

  const renderConversionKindBadge = (kind: ConversionKind | null) => {
    if (!kind) return null;
    switch (kind) {
      case "Lossless":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t("customField.convertValueType.kind.lossless")}
          </Badge>
        );
      case "Lossy":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t("customField.convertValueType.kind.lossy")}
          </Badge>
        );
      case "Impossible":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t("customField.convertValueType.kind.impossible")}
          </Badge>
        );
      case "NoChange":
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Info className="h-3 w-3" />
            {t("customField.convertValueType.kind.noChange")}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-primary" />
            {t("customField.convertValueType.title", { field: fieldLabel })}
          </DialogTitle>
          <DialogDescription>
            {t("customField.convertValueType.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Field Metadata & Current Type */}
          <div className="flex items-center justify-between rounded-md border border-nx-line bg-card p-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-nx-ink-4">{fieldKey}</span>
              <h4 className="text-sm font-medium text-nx-ink">{fieldLabel}</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-nx-ink-3">{t("customField.convertValueType.currentType")}:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {currentType}
              </Badge>
            </div>
          </div>

          {/* Target Type Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="convert-target-type-select" className="text-xs font-medium text-nx-ink-2">
              {t("customField.convertValueType.selectTargetType")}
            </Label>
            <Select
              value={selectedTargetType}
              onValueChange={onSelectTargetType}
              disabled={isConverting || isRollingBack || Boolean(lastResult?.applied)}
            >
              <SelectTrigger id="convert-target-type-select" aria-label={t("customField.convertValueType.selectTargetType")} className="h-9">
                <SelectValue placeholder={t("customField.convertValueType.selectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {availableTargetTypes.map((type) => {
                  const kind = classifyValueTypeConversion(currentType, type);
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span>{type}</span>
                        <span className="text-xs text-nx-ink-4">
                          ({t(`customField.convertValueType.kind.${kind.toLowerCase()}`)})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Conversion Transition Preview */}
          {selectedTargetType && (
            <div className="space-y-3 rounded-lg border border-nx-line bg-nx-raised p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-nx-ink">
                  <Badge variant="outline" className="font-mono">{currentType}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-nx-ink-4" />
                  <Badge variant="outline" className="font-mono">{selectedTargetType}</Badge>
                </div>
                {renderConversionKindBadge(conversionKind)}
              </div>

              {/* Kind Explanation Notes */}
              {conversionKind === "Lossless" && (
                <p className="text-xs text-success">
                  {t("customField.convertValueType.notes.lossless")}
                </p>
              )}

              {conversionKind === "Lossy" && (
                <div className="space-y-2">
                  <p className="text-xs text-warning">
                    {t("customField.convertValueType.notes.lossy")}
                  </p>
                  <div className="flex items-start gap-2 pt-1">
                    <Checkbox
                      id="confirm-data-loss"
                      checked={confirmDataLoss}
                      onCheckedChange={(c) => onConfirmDataLossChange(Boolean(c))}
                      disabled={isConverting || Boolean(lastResult?.applied)}
                    />
                    <label
                      htmlFor="confirm-data-loss"
                      className="text-xs font-medium leading-none text-nx-ink cursor-pointer pt-0.5"
                    >
                      {t("customField.convertValueType.confirmDataLossCheckbox")}
                    </label>
                  </div>
                </div>
              )}

              {conversionKind === "Impossible" && (
                <p className="text-xs text-destructive">
                  {t("customField.convertValueType.notes.impossible")}
                </p>
              )}

              {conversionKind === "NoChange" && (
                <p className="text-xs text-nx-ink-4">
                  {t("customField.convertValueType.notes.noChange")}
                </p>
              )}
            </div>
          )}

          {/* Outcome / Refusals / Rollback Display */}
          {lastResult && (
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
                            onClick={() => handleCopyJobId(String(lastResult.jobRunId))}
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

              {/* A rollback that ran is not the same as a rollback that restored everything.
                  `valuesGone` and `unreadable` are the records the command could NOT put back --
                  their rows still hold converted values -- so a non-zero skip count is reported as
                  a warning naming the shortfall, never as the clean "rolled back" confirmation. */}
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
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isConverting || isRollingBack}
          >
            {lastResult?.applied ? t("common.close") : t("common.cancel")}
          </Button>

          {!lastResult?.applied && (
            <Button
              type="button"
              variant="default"
              onClick={onExecuteConvert}
              disabled={!canExecute || isConverting}
            >
              <RefreshCcw className="me-1.5 h-3.5 w-3.5" />
              {isConverting
                ? t("customField.convertValueType.converting")
                : t("customField.convertValueType.executeButton")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
