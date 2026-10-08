/**
 * Value-Type Conversion Dialog (Wave 6 row 6.2)
 *
 * Provides operators with type compatibility preview, lossy data confirmation gating,
 * dry-run refusal inspection, execution, and rollback.
 */
"use client";

import React from "react";
import { RefreshCcw } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
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
import { ConvertValueTypePreview } from "./ConvertValueTypePreview";
import { ConvertValueTypeResultView } from "./ConvertValueTypeResultView";

/**
 * Documentation for module export
 */
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

/**
 * Documentation for ConvertValueTypeDialog
 */
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
          <ConvertValueTypePreview
            currentType={currentType}
            selectedTargetType={selectedTargetType}
            conversionKind={conversionKind}
            confirmDataLoss={confirmDataLoss}
            onConfirmDataLossChange={onConfirmDataLossChange}
            isConverting={isConverting}
            isApplied={Boolean(lastResult?.applied)}
          />

          {/* Outcome / Refusals / Rollback Display */}
          <ConvertValueTypeResultView
            lastResult={lastResult}
            lastRollbackResult={lastRollbackResult}
            canUpdate={canUpdate}
            isRollingBack={isRollingBack}
            onExecuteRollback={onExecuteRollback}
            onCopyJobId={handleCopyJobId}
          />
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
