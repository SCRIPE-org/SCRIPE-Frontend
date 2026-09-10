"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import type { ConversionKind } from "../../domain/entities/FieldInsight";

export interface ConvertValueTypePreviewProps {
  currentType: string;
  selectedTargetType: string;
  conversionKind: ConversionKind | null;
  confirmDataLoss: boolean;
  onConfirmDataLossChange: (checked: boolean) => void;
  isConverting: boolean;
  isApplied: boolean;
}

export function ConvertValueTypePreview({
  currentType,
  selectedTargetType,
  conversionKind,
  confirmDataLoss,
  onConfirmDataLossChange,
  isConverting,
  isApplied,
}: ConvertValueTypePreviewProps): React.ReactElement | null {
  const { t } = useI18n();

  if (!selectedTargetType) return null;

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
              disabled={isConverting || isApplied}
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
  );
}
